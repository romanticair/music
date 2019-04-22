<?php
  /**
   * 加载评论信息
   */
  require_once('func.php');
  $mid = $_GET['id'];
  $sql = 'SELECT * FROM comment WHERE mid=' . $mid;
  $data = sql_fetch_all($sql);
  echo json_encode($data);
?>