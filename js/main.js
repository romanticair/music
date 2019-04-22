$(function() {
  var $loading = $('.loading')
  var $oUl = $('.music-list > ul')
  var $footer = $('footer')
  var $prev = $('.prev')
  var $next = $('.next')
  var $playOrPause = $('.play-pause')
  var $lyric = $('.lyric')
  var $header = $('.lyric > header')
  var $img = $('.mark')
  var $start = $('.start')
  var $end = $('.end')
  var $music = $('#music')
  var $indicator = $('.indicator')
  var $bar = $('.loading-bar')
  var $circle = $('.circle')
  var $lyricUl = $('.lyric > section > ul')
  var $comment = $('.comment')
  var $location = $('.lyric .location')
  var $message = $('.message')

  var touchstart = 'touchstart'
  var touchmove = 'touchmove'
  var touchend = 'touchend'

  var viewH = $(window).height()
  var viewW = $(window).width()
  var mId, mIndex

    // 项目初始化
  function init() {
    loading()
    device()
    // 音乐列表页操作
    musicList.init()
    // 音乐详情页操作
    musicDetail.init()
    // 音乐播放器操作
    musicAudio.init()
  }

  // 兼容PC端和移动端
  function device () {
    var isMobile = /Mobile/i.test(navigator.userAgent)
    if (!isMobile) {
      touchstart = 'mousedown'
      touchmove = 'mousemove'
      touchend = 'mouseup'
    }
  }

  // 请求失败处理
  function errorDealer (e) {
    console.log(e.responseText)
  }

  // 音乐列表页操作
  var musicList = (function ($oUl) {
    var downY, preY, downT, curT = 0
    var parentH = $oUl.parent().height()
    var childH = null
    // 上下、左右开关
    var onoffT, onoffB, onoffR
    var onoffPlay = true
    var page = 1
    var timer, speed

    function init () {
      getData()
      bind($oUl)
      scroller($oUl)
    }

    function getData () {
      // 音乐列表
      $.ajax({
        url: 'music-list.php',
        type: 'get',
        dataType: 'json',
        success: function (data) {
          generateMusicList(data)
        },
        error: function (e) {
          errorDealer(e)
        }
      })
    }

    // 生成音乐列表
    function generateMusicList (arr) {
      var html = ''
      var template = ''
        + '<li data-id="?">'
        +   '<h3>title</h3>'
        +   '<p>singer</p>'
        + '</li>'

      arr.forEach(function (obj, mIndex) {
        html += template.replace('?', obj.id).replace('title', obj.title).replace('singer', obj.singer)
      })
      $oUl.html(html)
      // 初始化时，拿到 childH 的高度
      childH = $oUl.height()
    }

    // 滑动音乐列表
    function scroller ($oUl) {
      // 注册触碰滑动事件 注意要阻止默认行为，否则页面就滑动了
      $oUl.on(touchstart, function (ev) {
        ev.preventDefault()
        ev.stopPropagation()
        clearInterval(timer)
        // 初始化开关
        onoffT, onoffB = true
        onoffR = false
        // 如果音乐列表内容少于一页，不给滑动(这里注释,资源不足也给滑动)
        // if (parentH > childH) {
        //   return false
        // }

        var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev.originalEvent
        // 触摸的 Y 坐标
        downY = preY = touch.clientY
        // 触摸时的 top 位置
        downT = $(this).position().top
        // 存储加载音乐的列表 li(用于判断是否发送请求)
        var $loadingLi

        $(this).on(touchmove + '.move', function (ev) {
          // 拉动列表时，不要点播音乐
          onoffPlay = true
          var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev.originalEvent
          curT = $(this).position().top
          // 滑动的移动(滑动)速度(现在的位置 - 刚才的位置)
          speed = touch.clientY - preY
          // 记住刚才的位置，以测速度
          preY = touch.clientY
          if (curT >= 0 ) {
            // 滑动到顶部，界限 -- 结束时反弹
            if (onoffT) {
              onoffT = false
              downY = touch.clientY
            }
            // 第一次为 0，降低拉伸距离
            $(this).css('transform', 'translateY(' + (touch.clientY - downY)/3 + 'px)')
          }
          else if (curT <= (parentH - childH)) {
            // 滑动到底部，界限 -- ajax 加载新数据 -- 结束时反弹
            if (onoffB) {
              onoffB = false
              downY = touch.clientY
              $loadingLi = $('<li style="color: white">loading...</li>')
              $(this).append($loadingLi)
            }
            $(this).css('transform', 'translateY(' + ((parentH - childH) + (touch.clientY - downY)/3) + 'px)')
          }
          else {
            // 直接滑动
            $(this).css('transform', 'translateY(' + (downT + touch.clientY - downY) + 'px)')
          }
        })

        $(this).on(touchend + '.move', function (ev) {
          $(this).off('.move')
          // 请求新一页音乐列表
          if ($loadingLi) {
            $loadingLi.remove()
            $loadingLi = null
            $.ajax({
              url: 'page-music.php',
              type: 'get',
              dataType: 'json',
              data: {page: page},
              success: (function (data) {
                var html = ''
                var template = ''
                  + '<li data-id="?">'
                  +   '<h3>title</h3>'
                  +   '<p>singer</p>'
                  + '</li>'

                data.forEach(function (obj, mIndex) {
                  html += template.replace('?', obj.id).replace('title', obj.title).replace('singer', obj.singer)
                })
                $(this).append(html)
                // 更新 childH 的高度
                childH = $(this).height()
                page++
              }).bind($(this)
              )
            })
          }

          if (!onoffR) {
            clearInterval(timer)
            timer = setInterval((function () {
              var curTop = $(this).position().top
              // 上或下边界(上下边界 50px 距离之外瞬间弹回来)，或 speed 过小时，缓缓弹回来，停止定时器
              if (Math.abs(speed) < 1 || curTop > 50 || curTop < (parentH - childH - 50)) {
                // 单次入口，因为清除了定时器(超出边界 50px 瞬间进来，而任何情况都进来)
                clearInterval(timer)
                if (curTop >= 0) {
                  // 上边界
                  $(this).css('transition', '.2s')
                  $(this).css('transform', 'translateY(0px)')
                }
                else if (curT <= (parentH - childH)) {
                  // 下边界
                  $(this).css('transition', '.2s')
                  $(this).css('transform', 'translateY(' + (parentH - childH) + 'px)')
                }
              }
              // 直接滑动的情况，直至速度小于 1
              else {
                speed *= 0.9
                $(this).css('transform', 'translateY(' + (curTop + speed) + 'px)')
              }
            }).bind($(this)), 50)
          }
          onoffPlay = false
        })
        $(this).on('transitionend', function () {
          $(this).css('transition', '')
        })
      })
    }

    // 播放样式激活，歌词和音乐列表切换事件等
    function bind ($oUl) {
      $oUl.delegate('li', touchend, function () {
        // 不是滑动状态时
        if (!onoffPlay) {
          $(this).addClass('active').siblings().removeClass('active')
          mId = $(this).data('id')
          mIndex = $(this).index()
          // 载入音乐
          musicAudio.loadMusic(mId)
        }
      })

      $footer.on(touchstart, function () {
        // 目前正在播放 ? 则跳转到歌词页
        if (mId) {
          musicDetail.slideUp()
        }
      })
    }

    // 显示歌手歌名
    function show (name, title, img) {
      $footer.find('.mark').attr('src', img)
      $footer.find('h3').html(title)
      $footer.find('p').html(name)
      // 同时把正在播放的按钮状态给表示出来
      $playOrPause.show()
    }

    return {
      init: init,
      show: show
    }
  })($oUl)

  // 音乐播放器操作
  var musicDetail = (function () {
    var lyricArr, lyricH, $lyricLi
    var downX, timer
    var range = 50
    var onoffLyric = false

    function init () {
      // $lyric.css('transform', 'translateY(' + viewH + 'px)')
      $comment.css('transform', 'translateX(' + viewW + 'px)')
      bind()
    }

    function show (name, title, lyric) {
      $header.find('h3').html(title)
      $header.find('h5').html(name)
      $lyricUl.empty().css('transform', 'translateY(0)')
      lyricArr = parseText(lyric)
      // console.log(lyricArr)

      // 上歌词
      for (var i=0; i<lyricArr.length; i++) {
        $lyricUl.append('<li>' + lyricArr[i][1] + '</li>')
      }

      // 给第一句歌词加激活样式
      $lyricLi = $lyricUl.find('li')
      $lyricLi.first().addClass('active')
      lyricH = $lyricLi.first().outerHeight(true)
    }

    // 解析歌词
    function parseText (text) {
      // 匹配 [ 开头 [^[] 不包含 [ 所有字符
      var arr = text.match(/\[[^[]+/g)
      // 前四行不要了，当前的歌词文件决定的
      arr.splice(0,4)
      var data = []
      for (var i=0; i<arr.length; i++) {
        // 时间和歌词分开在一组
        var lyric = arr[i].substring(10).replace(/\s/g, '')
        if (lyric) {
          data[data.length] = [formateTime(arr[i].substring(0, 10)), lyric]
        }
      }

      // 最后一行也不要了
      data.splice(data.length - 1)
      return data
    }

    // 格式时间
    function formateTime (num) {
      num = num.substring(1, num.length - 1)
      var arr = num.split(':')
      // 时间都转成秒
      return parseFloat((parseFloat(arr[0] * 60) + parseFloat(arr[1])).toFixed(2))
    }

    // 滚动歌词
    function scrollLyric (time) {
      var center = 5
      for (var i=0; i<lyricArr.length; i++) {
        // 不是最后一句且时间在上一句下一句之间
        if (i != lyricArr.length -1 && time > lyricArr[i][0] && time < lyricArr[i+1][0]) {
          $lyricLi.eq(i).addClass('active').siblings().removeClass('active')
          // 歌词走到了中间(5)，则一句句向上滚动
          if (i > center) {
            $lyricUl.css('transform', 'translateY(' + (-lyricH * (i - center)) + 'px)')
          }
          else {
            $lyricUl.css('transform', 'translateY(0)')
          }
        }
        else if (i === lyricArr.length - 1 && time > lyricArr[i][0]) {
          $lyricLi.eq(i).addClass('active').siblings().removeClass('active')
          $lyricUl.css('transform', 'translateY(' + (-lyricH * (i - center)) + 'px)')
        }
      }
    }

    // 展开歌词
    function slideUp () {
      $lyric.css('transform', 'translateY(' + (-viewH) + 'px)')
      $lyric.css('transition', '.5s')
    }

    // 向下收缩
    function slideDown () {
      $lyric.css('transform', 'translateY(' + viewH + 'px)')
      $lyric.css('transition', '.5s')
      $location.find('div').eq(0).addClass('active').siblings().removeClass('active')
      if (!onoffLyric) {
        onoffLyric = true
      }
    }
    
    function bind () {
      // 触碰顶部回到音乐列表页
      $header.on(touchstart, function () {
        slideDown()
      })

      // 歌词页与评论页切换
      $lyric.on(touchstart, function (ev) {
        var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev.originalEvent
        downX = touch.clientX
        $(this).on(touchend, function (ev) {
          var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev.originalEvent
          // 评论页
          if (touch.clientX - downX < -range && !onoffLyric) {
            // 纯属自己造成的麻烦
            // $lyric.css('transform', 'translateX(' + (-viewW) + 'px)')
            $(this).find('section').css('transform', 'translateX(' + (-viewW) + 'px)')
            $(this).find('.progress').css('transform', 'translateX(' + (-viewW) + 'px)')
            $(this).find('.controller').css('transform', 'translateX(' + (-viewW) + 'px)')
            $comment.css('transform', 'translateX(0)')
            $location.find('div').eq(1).addClass('active').siblings().removeClass('active')
            // 加载评论信息
            loadComment()
            clearInterval(timer)
            // 开启滚动评论信息定时器
            timer = setInterval(scrollComment, 3000)
            onoffLyric = true
          }
          // 歌词页
          else if (touch.clientX - downX > range) {
            $(this).find('section').css('transform', 'translateX(0)')
            $(this).find('.progress').css('transform', 'translateX(0)')
            $(this).find('.controller').css('transform', 'translateX(0)')
            $comment.css('transform', 'translateX(' + viewW + 'px)')
            $location.find('div').eq(0).addClass('active').siblings().removeClass('active')
            // 停止定时器评论信息滚动
            clearInterval(timer)
            onoffLyric = false
          }
        })
      })

      // 添加新的评论音乐
      $comment.find('input[type="button"]').on(touchstart, function () {
        addComment()
      })
    }

    // 载入评论
    function loadComment () {
      $message.empty()
      $.ajax({
        url: 'load-comment.php',
        type: 'get',
        dataType: 'json',
        data: { id: mId },
        success: function (data) {
          $.each(data, function (index, obj) {
            var $li = $('<li>' + obj.content + '</li>')
            $message.prepend($li)
          })
        }
      })
    }

    // 添加评论
    function addComment () {
      var val = $comment.find('textarea').val()
      $comment.find('textarea').val('')
      $.ajax({
        url: 'add-comment.php',
        type: 'post',
        dataType: 'json',
        data: {
          id: mId,
          text: val
        },
        success: function (data) {
          if (data.code) {
            console.log(data)
            var $li = '<li>' + data.message + '</li>'
            $message.prepend($li)
          }
        }
      })
    }

    // 滚动的评论
    function scrollComment () {
      // 将最底的评论放置到最上面(滚动数据)
      var $last = $message.find('li').last()
      $message.prepend($last)
      $message.find('list').last().remove()
      $last.css('opacity', 0)
      setTimeout(function () {
        $last.css('opacity', 1)
      }, 200)
    }

    return {
      init: init,
      slideUp: slideUp,
      slideDown: slideDown,
      show: show,
      scrollLyric: scrollLyric
    }
  })()

  // 音乐播放器操作
  var musicAudio = (function () {
    var onoffM = false
    var timer, disX
    var offset = 0

    function init () {
      bind()
    }

    function bind () {
      $playOrPause.on(touchstart, function () {
        if (onoffM) {
          play()
        }
        else {
          pause()
        }
      })

      // 快进
      $indicator.on(touchstart, function (ev) {
        var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev.originalEvent
        var preX = touch.clientX 
        disX = touch.clientX - $(this).position().left
        // 可能直接点击，没有拉动，17 是 circle 的宽
        offset = (disX -17) / $(this).width()
        clearInterval(timer)
        $(document).on(touchmove + '.move', (function (ev) {
          ev.stopPropagation()
          var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev.originalEvent
          var distance = touch.clientX - preX - 17 + disX
          // 拉到最左
          if (distance <= 0) {
            distance = 0
          }
          // 拉到最右
          else if (distance >= $(this).width()) {
            distance = $(this).width()
          }

          // offset = distance / $(this).width() * 100
          $bar.css('width', distance)
          $circle.css('left', distance)
          offset = distance / $(this).width()
          }).bind($(this))
        )

        // 播放进度也要跟着变
        $(document).on(touchend + '.move', function () {
          $(this).off('.move')
          // $music[0].currentTime = offset / 100 * $music[0].duration
          $music[0].currentTime = offset * $music[0].duration
          progress()
          // 取歌词滚动的最小时间差，这里直接取 50ms
          timer = setInterval(progress, 50)
        })
      })

      $prev.on(touchstart, function () {
        prev()
      })
      $next.on(touchend, function () {
        next()
      })
    }

    // 加载音乐 -- 获取该歌曲所有信息
    function loadMusic (mId) {
      $.ajax({
        url: 'music-audio.php',
        type: 'get',
        dataType: 'json',
        data: {id: mId},
        success: function (data) {
          show(data)
        },
        error: function (e) {
          errorDealer(e)
        }
      })
    }

    // 显示音乐细节
    function show (obj) {
      // 展示歌名，歌手名，图片
      musicList.show(obj.singer, obj.title, obj.img)
      // 载入顶部歌手、歌曲名和歌词信息
      musicDetail.show(obj.singer, obj.title, obj.lyric)
      $music.attr('src', obj.audio)
      play()
      // 媒体播放时仅触发一次
      $music.one('canplaythrough', function () {
        // 格式化音频时间和进度(转成 dom 对象)
        $end.html(formatTime($music[0].duration))
      })
      // 媒体播放结束时自动播放下一首
      $music.one('ended', function () {
        next()
      })
    }

    // 播放音乐
    function play () {
      onoffM = false
      clearInterval(timer)
      // 转动图片
      $img.addClass('animate')
      // 换按钮图片
      $playOrPause.find('img').attr('src', 'img/details_pause.png')
      // 转成 js 对象，jquery 的控制方法暂且未知, status ?
      $music[0].play()
      progress()
      timer = setInterval(progress, 1000)
    }

    // 停止播放
    function pause () {
      onoffM = true
      // 停止转动
      $img.removeClass('animate')
      // 换按钮图片
      $playOrPause.find('img').attr('src', 'img/list_audioPlay.png')
      $music[0].pause()
      clearInterval(timer)
    }

    // 下一首歌
    function next () {
      var $oLi = $oUl.find('li')
      mIndex = mIndex > $oLi.length - 1 ? 0 : mIndex + 1
      mId = $oLi.eq(mIndex).data('id')
      $oLi.eq(mIndex).addClass('active').siblings().removeClass('active')
      loadMusic(mId)
    }

    // 上一首歌
    function prev () {
      var $oLi = $oUl.find('li')
      mIndex = mIndex < 1 ? $oLi.length - 1 : mIndex - 1
      mId = $oLi.eq(mIndex).data('id')
      $oLi.eq(mIndex).addClass('active').siblings().removeClass('active')
      loadMusic(mId)
    }

    // 格式化时间进度
    function formatTime(num) {
      num = parseInt(num)
      var m = Math.floor(num % 3600 / 60)
      var s = Math.floor(num % 60)
      return toZero(m) + ':' + toZero(s)
    }

    // 补零处理
    function toZero (time) {
      time = time > 10 ? time : '0' + time
      return time
    }

    // 播放时间进度
    function progress () {
      $start.html(formatTime($music[0].currentTime))
      offset = $music[0].currentTime / $music[0].duration * 100
      $bar.css('width', offset + '%')
      $circle.css('left', offset + '%')
      // 滚动歌词
      musicDetail.scrollLyric($music[0].currentTime)
    }

    return {
      init: init,
      loadMusic: loadMusic
    }
  })()

  // loaidng
  function loading() {
    var arr = ['bg.jpg', 'detailsBg.jpg', 'details_pause.png', 'details_play.png', 'details_next.png', 'details_prev.png', 'list_audioBg.png', 'miaov.jpg'];
    var num = 1
    // 预加载(放到 html 的头部效果更好)
    $.each(arr, function (index, val) {
      var img = new Image()
      img.onload = function () {
        if (num >= arr.length ) {
          $loading.animate({opacity: 0}, 1000, function () {
            $(this).remove()
          })
        }
        num++
      }

      img.onerror = function () {
        $loading.animate({opacity: 0}, 1000, function () {
          $(this).remove()
        })
      }

      img.src = 'img/' + val
    })
  }

  init()
})
