from django.core.management.base import BaseCommand
from django.utils import timezone
import time
import logging
import sys

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = '运行API测试模块的定时任务调度器'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='检查间隔（秒），默认60秒'
        )
        parser.add_argument(
            '--once',
            action='store_true',
            help='只执行一次检查，不循环'
        )

    def handle(self, *args, **options):
        interval = options['interval']
        run_once = options['once']

        self.stdout.write(self.style.SUCCESS(f"{'='*60}"))
        self.stdout.write(self.style.SUCCESS("启动定时任务调度器"))
        self.stdout.write(self.style.SUCCESS(f"检查间隔: {interval}秒"))
        self.stdout.write(self.style.SUCCESS(f"调度模块: API测试"))
        self.stdout.write(self.style.SUCCESS(f"{'='*60}"))

        while True:
            try:
                now = timezone.now()
                self.stdout.write(f"\n[{now.strftime('%Y-%m-%d %H:%M:%S')}] 开始检查任务...")

                # 调度 API 测试模块的定时任务
                api_count = self.schedule_api_tasks()

                if api_count > 0:
                    self.stdout.write(self.style.SUCCESS(f"✓ 本次调度执行了 {api_count} 个任务"))
                else:
                    self.stdout.write("  没有需要执行的任务")

                if run_once:
                    self.stdout.write(self.style.WARNING("单次执行模式，调度器退出"))
                    break

                self.stdout.write(f"等待 {interval} 秒后进行下一次检查...")
                time.sleep(interval)

            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING("\n\n调度器已停止"))
                break
            except Exception as e:
                logger.error(f"调度器运行出错: {e}", exc_info=True)
                self.stdout.write(self.style.ERROR(f"调度器运行出错: {e}"))
                if run_once:
                    break
                self.stdout.write(f"等待 {interval} 秒后重试...")
                time.sleep(interval)

    def schedule_api_tasks(self):
        """调度 API 测试模块的定时任务"""
        try:
            from apps.api_testing.models import ScheduledTask
            from apps.api_testing.views import ScheduledTaskViewSet

            # 获取所有活跃的定时任务
            active_tasks = ScheduledTask.objects.filter(status='ACTIVE')
            executed_count = 0

            # 显示所有活跃任务的调试信息
            if active_tasks.exists():
                now = timezone.now()
                self.stdout.write(f"  [API] 活跃任务数: {active_tasks.count()}")
                for task in active_tasks:
                    if task.next_run_time:
                        time_diff = (task.next_run_time - now).total_seconds()
                        if time_diff > 0:
                            self.stdout.write(f"        - {task.name}: 距下次执行还有 {int(time_diff)} 秒")
                        else:
                            self.stdout.write(f"        - {task.name}: 应该立即执行！")
                    else:
                        self.stdout.write(f"        - {task.name}: 未设置下次执行时间")

            for task in active_tasks:
                if task.should_run_now():
                    self.stdout.write(f"  [API] 执行任务: {task.name}")
                    self.stdout.write(f"       类型: {task.get_task_type_display() if hasattr(task, 'get_task_type_display') else task.task_type}, 触发方式: {task.get_trigger_type_display() if hasattr(task, 'get_trigger_type_display') else task.trigger_type}")
                    try:
                        # 创建执行日志
                        from apps.api_testing.models import TaskExecutionLog
                        execution_log = TaskExecutionLog.objects.create(
                            task=task,
                            status='PENDING'
                        )

                        # 调用任务执行方法
                        view = ScheduledTaskViewSet()
                        view._execute_task_async(task, execution_log)

                        executed_count += 1
                        self.stdout.write(self.style.SUCCESS(f"    ✓ 任务 {task.name} 已启动"))

                    except Exception as e:
                        logger.error(f"执行API任务 {task.name} 时出错: {e}", exc_info=True)
                        self.stdout.write(self.style.ERROR(f"    ✗ 任务 {task.name} 执行失败: {e}"))

            return executed_count

        except Exception as e:
            logger.error(f"调度API任务时出错: {e}", exc_info=True)
            self.stdout.write(self.style.ERROR(f"[API] 调度失败: {e}"))
            return 0
