<?php
  /**
   * 获取音乐列表
   */
  require_once('func.php');
  $sql = 'SELECT id, singer, title FROM music';
  $data = sql_fetch_all($sql);
  echo json_encode($data);
  //var_dump($data);
?>