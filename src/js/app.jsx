import React from 'react';
import ReactDOM from 'react-dom';

class Layout extends React.Component {
  render() {
    return (
      <h1>It works!</h1>
    );
  }
}

// 由于使用 CND 来引入 jQuery, 故这里直接使用 $ 符号
ReactDOM.render(<Layout/>, $('#app')[0]);
