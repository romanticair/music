<?php
  /**
   * 获取多条音乐信息
   */

  $page = isset($_GET['page']) ? $_GET['page'] : null;
  if (!$page) {
    exit('参数有误');
  }

  require_once('func.php');
  $len = 3;
  $start = $page * $len;
  $sql = 'SELECT id, singer, title FROM music LIMIT ' . $start . ',' . $len;
  $data = sql_fetch_all($sql);
  echo json_encode($data);
?>