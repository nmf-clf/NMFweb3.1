  export const dataSource = [];
  export const total = 103;
  for (let i = 0; i < 103; i++) {
    dataSource.push({
      key: i,
      name: `Edward King ${i+1}`,
      age: 32,
      address: `London, Park Lane no. ${i}`,
    });
  }
  
  export const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '住址',
      dataIndex: 'address',
      key: 'address',
    },
  ];
  
