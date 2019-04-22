<?php
  /**
   * 公用函数
   */

  require_once('config.php');

  /**
   * 连接数据库
   */
  function sql_connect() {
    $cnt = mysqli_connect(DB_HOST, DB_USER, DB_PW, DB_NAME);
    mysqli_query($cnt, 'SET NAMES UTF8');
    if (!$cnt) {
      exit('连接失败');
    }

    return $cnt;
  }


  /**
   * 执行一条查询语句获取多条数据
   *
   * @param $sql String
   * @returns 二维关联数组
   */
  function sql_fetch_all ($sql) {
    $cnt = sql_connect();
    $query = mysqli_query($cnt, $sql);
    if (!$query) {
      // 查询失败
      return false;
    }

    while($row = mysqli_fetch_assoc($query)) {
      $result[] = $row;
    }

    mysqli_free_result($query);
    mysqli_close($cnt);
    return $result;
  }


  /**
   * 执行一条查询语句获取一条数据
   *
   * @param $sql String
   * @returns 关联数组
   */
  function sql_fetch_one ($sql) {
    $result = sql_fetch_all($sql);
    return isset($result) ? $result[0] : null;
  }


  /**
   * 执行一条 [增|删|改] 语句
   *
   * @param $sql String
   * @returns Number
   */
  function sql_execute($sql) {
    $cnt = sql_connect();
    $query = mysqli_query($cnt, $sql);
    if (!$query) {
      // 查询失败
      return false;
    }

    // 增删改语句执行后起作用的行数
    $affected_rows = mysqli_affected_rows($cnt);
    mysqli_close($cnt);
    return $affected_rows;
  }
?>