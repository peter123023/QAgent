import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title } = Typography;

const ProjectList = () => {
  return (
    <Card>
      <Title level={3}>Project List</Title>
      <Empty description="Project List functionality coming soon" />
    </Card>
  );
};

export default ProjectList;