<?php
  /**
   * 根据 id 获取一首歌的音频
   */

  $id = isset($_GET['id']) ? $_GET['id'] : null;
  if (!$id) {
    exit('参数有误');
  }

  require_once('func.php');
  $sql = 'SELECT * FROM music WHERE id=' . $id;
  $data = sql_fetch_one($sql);
  // 读取全部内容，歌词文件编码为GBK，进行转码处理
  $fPath = $data['lyric'];
  $file = fopen($fPath, 'r');
  $data['lyric'] = iconv("GBK","UTF-8", fread($file, filesize($fPath)));
  // 关闭文件
  fclose($file);
  echo json_encode($data);
  // var_dump($data);
?>