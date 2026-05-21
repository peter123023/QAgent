# -*- coding: utf-8 -*-
"""
ReAct Agent 执行引擎
复用现有 AIModelService 进行 LLM 调用
"""
import json
import logging
from typing import Dict, Any, List, Optional
from apps.requirement_analysis.models import AIModelService, AIModelConfig
from .tools import registry

logger = logging.getLogger(__name__)


SYSTEM_PROMPT_TEMPLATE = """你是一个智能测试助手，名为 QAgent-TestBot。
你的任务是通过调用工具来帮助用户完成测试相关的操作。

你可以使用以下工具：
{tools_description}

请严格遵循以下 ReAct 格式进行思考和行动：
1. Thought: 分析用户意图，判断是否需要调用工具
2. Action: 如果需要工具，输出 JSON 格式的工具调用：{{"tool": "工具名", "params": {{...}}}}
3. Observation: 观察工具返回的结果
4. 重复以上步骤，直到可以给出最终回答

重要规则：
- 一次只能调用一个工具
- 工具调用必须使用 JSON 格式，且必须包含在 Action: 之后
- 如果不需要工具，直接给出最终回答
- 所有回复使用中文

示例：
用户：查询一下高优先级的用例
Thought: 用户想查询高优先级的测试用例，我需要调用 list_testcases 工具，priority 参数设置为 high。
Action: {{"tool": "list_testcases", "params": {{"priority": "high", "limit": 5}}}}
Observation: [工具返回结果]
Thought: 我已经获取到结果，可以直接回复用户。
Final Answer: 已为您查询到以下高优先级用例：...
"""


class ReActEngine:
    """ReAct 执行引擎"""

    def __init__(self, model_config: Optional[AIModelConfig] = None):
        self.model_config = model_config
        self.max_iterations = 10
        self.tools_prompt = registry.get_tools_prompt()

    def _build_system_prompt(self) -> str:
        return SYSTEM_PROMPT_TEMPLATE.format(tools_description=self.tools_prompt)

    async def _call_llm(self, messages: List[Dict[str, str]]) -> str:
        """调用 LLM，复用 AIModelService"""
        if not self.model_config:
            # 尝试获取一个默认配置
            self.model_config = await self._get_default_model_config()
        if not self.model_config:
            raise Exception("没有可用的 AI 模型配置，请先在【设置-AI模型配置】中添加模型")

        response = await AIModelService.call_openai_compatible_api(self.model_config, messages)
        content = response['choices'][0]['message']['content']
        return content

    async def _get_default_model_config(self) -> Optional[AIModelConfig]:
        """获取默认的 AI 模型配置（writer 角色优先）"""
        from asgiref.sync import sync_to_async
        config = await sync_to_async(AIModelConfig.objects.filter(is_active=True).first)()
        return config

    def _parse_action(self, content: str) -> Optional[Dict[str, Any]]:
        """从 LLM 回复中解析 Action JSON（支持嵌套大括号）"""
        import re

        def _extract_balanced_json(text: str, start_idx: int) -> str:
            """用括号计数法提取完整 JSON 对象"""
            brace = 0
            in_str = False
            esc = False
            jstart = None
            for i, ch in enumerate(text[start_idx:]):
                if esc:
                    esc = False
                    continue
                if ch == '\\' and in_str:
                    esc = True
                    continue
                if ch == '"':
                    in_str = not in_str
                    continue
                if in_str:
                    continue
                if ch == '{':
                    if brace == 0:
                        jstart = start_idx + i
                    brace += 1
                elif ch == '}':
                    brace -= 1
                    if brace == 0 and jstart is not None:
                        return text[jstart:start_idx + i + 1]
            return None

        # 策略1：匹配 Action: 后面的 JSON
        m = re.search(r'Action:\s*', content, re.IGNORECASE)
        if m:
            js = _extract_balanced_json(content, m.end())
            if js:
                try:
                    return json.loads(js)
                except json.JSONDecodeError:
                    pass

        # 策略2：直接匹配包含 "tool" 的 JSON 对象
        for m in re.finditer(r'\{', content):
            js = _extract_balanced_json(content, m.start())
            if js and '"tool"' in js:
                try:
                    return json.loads(js)
                except json.JSONDecodeError:
                    continue
        return None

    def _has_final_answer(self, content: str) -> bool:
        """判断是否包含最终答案"""
        return 'Final Answer:' in content or '最终回答：' in content or '最终答案' in content

    def _extract_final_answer(self, content: str) -> str:
        """提取最终答案"""
        import re
        patterns = [
            r'Final Answer:\s*(.*)',
            r'最终回答：\s*(.*)',
            r'最终答案[：:]\s*(.*)',
        ]
        for p in patterns:
            match = re.search(p, content, re.DOTALL)
            if match:
                return match.group(1).strip()
        # 如果没有标记，直接返回内容（去除 Thought/Action 部分）
        lines = []
        for line in content.split('\n'):
            if line.strip().startswith('Thought:') or line.strip().startswith('Action:'):
                continue
            lines.append(line)
        return '\n'.join(lines).strip() or content.strip()

    async def run(self, user_message: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        执行 ReAct 循环
        返回: {"final_answer": str, "steps": List[Dict]}
        """
        steps = []
        messages = [
            {"role": "system", "content": self._build_system_prompt()}
        ]

        if history:
            messages.extend(history)

        messages.append({"role": "user", "content": user_message})

        iteration = 0
        while iteration < self.max_iterations:
            iteration += 1
            logger.info(f"ReAct iteration {iteration}")

            try:
                llm_response = await self._call_llm(messages)
            except Exception as e:
                logger.error(f"LLM call failed: {e}")
                return {"final_answer": f"调用 AI 模型失败: {str(e)}", "steps": steps}

            steps.append({"role": "assistant", "content": llm_response, "iteration": iteration})

            # 检查是否是最终答案
            if self._has_final_answer(llm_response) or iteration == self.max_iterations:
                final = self._extract_final_answer(llm_response)
                return {"final_answer": final, "steps": steps}

            # 尝试解析 Action
            action = self._parse_action(llm_response)
            if not action:
                # 没有 Action，也没有 Final Answer，当作最终回复
                return {"final_answer": llm_response, "steps": steps}

            tool_name = action.get("tool")
            params = action.get("params", {})

            if not tool_name:
                return {"final_answer": llm_response, "steps": steps}

            tool = registry.get_tool(tool_name)
            if not tool:
                observation = f"工具 '{tool_name}' 不存在。可用工具: {[t.name for t in registry.list_tools()]}"
            else:
                tool_result = await tool.execute(params)
                observation = json.dumps(tool_result, ensure_ascii=False, indent=2)

            steps.append({
                "role": "tool",
                "tool_name": tool_name,
                "params": params,
                "result": observation,
                "iteration": iteration
            })

            # 将 Observation 加入上下文
            messages.append({"role": "assistant", "content": llm_response})
            messages.append({"role": "user", "content": f"Observation: {observation}\n\n请根据观察结果继续思考或直接给出最终回答。"})

        final = self._extract_final_answer(llm_response) if llm_response else "已达到最大迭代次数"
        return {"final_answer": final, "steps": steps}
