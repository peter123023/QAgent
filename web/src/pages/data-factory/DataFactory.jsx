import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title } = Typography;

const DataFactory = () => {
  return (
    <Card>
      <Title level={3}>Data Factory</Title>
      <Empty description="Data Factory functionality coming soon" />
    </Card>
  );
};

export default DataFactory;