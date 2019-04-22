<?php
  /**
   * 增加新的评论信息
   */
  require_once('func.php');
  $mid = $_POST['id'];
  $text = htmlspecialchars($_POST['text']);
  $sql = 'INSERT INTO comment(mid, content, created) VALUES(' . $mid . ',"' . $text . '", NOW())';
  $query = sql_execute($sql);
  if ($query) {
    echo '{"code":"1","message":"'.$text.'"}';
  }
	else {
		echo '{"code":"0","message":"添加失败"}';
	}
?>