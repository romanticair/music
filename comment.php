<?php
  /**
   * 根据 mid 获取评论列表
   */

  $mid = isset($_GET['id']) ? $_GET['id'] : null;
  if (!$mid) {
    exit('参数有误');
  }

  require_once('func.php');
  // 根据时间降序
  $sql = 'SELECT content, created FROM comment WHERE mid=' . $mid . ' ORDER BY created DESC';
  $data = sql_fetch_all($sql);
  // echo $data;
  var_dump($data);
?>