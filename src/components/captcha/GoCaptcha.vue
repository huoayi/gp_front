<template>
  <div class="wg-cap-wrap">
    <div class="wg-cap-wrap__header">
      <span>请在下图<em>依次</em>点击：</span>
      <img class="wg-cap-wrap__thumb" v-if="thumbBase64Code" :src="thumbBase64Code" alt=" " />
    </div>
    <div class="wg-cap-wrap__body">
      <img
        class="wg-cap-wrap__picture"
        v-if="imageBase64Code"
        :src="imageBase64Code"
        alt=" "
        @click="handleClickPos($event)"
      />
      <img
        class="wg-cap-wrap__loading"
        src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ibWFyZ2luOiBhdXRvOyBiYWNrZ3JvdW5kOiByZ2JhKDI0MSwgMjQyLCAyNDMsIDApOyBkaXNwbGF5OiBibG9jazsgc2hhcGUtcmVuZGVyaW5nOiBhdXRvOyIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjM2LjgxMDEiIHI9IjEzIiBmaWxsPSIjM2U3Y2ZmIj4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN5IiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgY2FsY01vZGU9InNwbGluZSIga2V5U3BsaW5lcz0iMC40NSAwIDAuOSAwLjU1OzAgMC40NSAwLjU1IDAuOSIga2V5VGltZXM9IjA7MC41OzEiIHZhbHVlcz0iMjM7Nzc7MjMiPjwvYW5pbWF0ZT4KICA8L2NpcmNsZT4KPC9zdmc+"
        alt="正在加载中..."
      />
      <template v-for="(dot, key) in dots" :key="key">
        <div class="wg-cap-wrap__dot" :style="`top: ${dot.y}px; left:${dot.x}px;`">
          <span>{{ dot.index }}</span>
        </div>
      </template>
    </div>
    <div class="wg-cap-wrap__footer">
      <div class="wg-cap-wrap__ico">
        <img class="icon" @click="handleCloseEvent" src="@/assets/img/close.webp" alt="关闭" />

        <img class="icon" @click="handleRefreshEvent" src="@/assets/img/refresh.webp" alt="刷新" />
      </div>
      <div class="wg-cap-wrap__btn">
        <button @click="handleConfirmEvent">确认</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoCaptcha',
  props: {
    value: Boolean,
    width: {
      type: String,
      default: '310px',
    },
    height: {
      type: String,
      default: '240px',
    },
    calcPosType: {
      type: String,
      default: 'dom',
      validator: (value) => ['dom', 'screen'].includes(value),
    },
    maxDot: {
      type: Number,
      default: 5,
      // validator: value => value > 10
    },
    imageBase64: String,
    thumbBase64: String,
  },
  data() {
    return {
      dots: [],
      imageBase64Code: '',
      thumbBase64Code: '',
    };
  },
  watch: {
    value() {
      this.dots = [];
      this.imageBase64Code = '';
      this.thumbBase64Code = '';
    },
    imageBase64(val) {
      this.dots = [];
      this.imageBase64Code = val;
    },
    thumbBase64(val) {
      this.dots = [];
      this.thumbBase64Code = val;
    },
  },
  computed: {
    style() {
      return `width:${this.width}; height:${this.height};`;
    },
  },
  methods: {
    /**
     * @Description: 处理关闭事件
     */
    handleCloseEvent() {
      this.$emit('close');
      this.dots = [];
      this.imageBase64Code = '';
      this.thumbBase64Code = '';
    },
    /**
     * @Description: 处理刷新事件
     */
    handleRefreshEvent() {
      this.dots = [];
      this.$emit('refresh');
    },
    /**
     * @Description: 处理确认事件
     */
    handleConfirmEvent() {
      this.$emit('confirm', this.dots);
    },
    /**
     * @Description: 处理dot
     * @param ev
     */
    handleClickPos(ev) {
      if (this.dots.length >= this.maxDot) {
        return;
      }
      const e = ev || window.event;
      e.preventDefault();
      const dom = e.currentTarget;

      const { domX, domY } = this.getDomXY(dom);
      // ===============================================
      // @notice 如 getDomXY 不准确可尝试使用 calcLocationLeft 或 calcLocationTop
      // const domX = this.calcLocationLeft(dom)
      // const domY = this.calcLocationTop(dom)
      // ===============================================

      let mouseX = navigator.appName === 'Netscape' ? e.pageX : e.x + document.body.offsetTop;
      let mouseY = navigator.appName === 'Netscape' ? e.pageY : e.y + document.body.offsetTop;

      if (this.calcPosType === 'screen') {
        mouseX = navigator.appName === 'Netscape' ? e.clientX : e.x;
        mouseY = navigator.appName === 'Netscape' ? e.clientY : e.y;
      }

      // 计算点击的相对位置
      const xPos = mouseX - domX;
      const yPos = mouseY - domY;

      // 转整形
      const xp = parseInt(xPos.toString());
      const yp = parseInt(yPos.toString());

      // 减去点的一半
      this.dots.push({
        x: xp - 11,
        // x: xp,
        y: yp - 11,
        // y: yp,
        index: this.dots.length + 1,
      });
      return false;
    },
    /**
     * @Description: 找到元素的屏幕位置
     * @param el
     */
    calcLocationLeft(el) {
      let tmp = el.offsetLeft;
      let val = el.offsetParent;
      while (val != null) {
        tmp += val.offsetLeft;
        val = val.offsetParent;
      }
      return tmp;
    },
    /**
     * @Description: 找到元素的屏幕位置
     * @param el
     */
    calcLocationTop(el) {
      let tmp = el.offsetTop;
      let val = el.offsetParent;
      while (val != null) {
        tmp += val.offsetTop;
        val = val.offsetParent;
      }
      return tmp;
    },
    /**
     * @Description: 找到元素的屏幕位置
     * @param dom
     */
    getDomXY(dom) {
      let x = 0;
      let y = 0;
      if (dom.getBoundingClientRect) {
        let box = dom.getBoundingClientRect();
        let D = document.documentElement;
        x = box.left + Math.max(D.scrollLeft, document.body.scrollLeft) - D.clientLeft;
        y = box.top + Math.max(D.scrollTop, document.body.scrollTop) - D.clientTop;
      } else {
        while (dom !== document.body) {
          x += dom.offsetLeft;
          y += dom.offsetTop;
          dom = dom.offsetParent;
        }
      }
      return {
        domX: x,
        domY: y,
      };
    },
  },
};
</script>

<style lang="less">
.is-mobile {
  .wg-cap-wrap {
    // padding: 0 0 30px  ;
  }
  .wg-cap-wrap__header span {
    font-size: 0.75rem;
  }
}
.wg-cap-wrap {
  width: 100%;
  height: 100%;
  background: #313131;
  padding: 0px 25px 30px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  .flex-mode(column);
}
.wg-cap-wrap__header {
  height: 50px;
  width: 100%;
  font-size: 15px;

  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.wg-cap-wrap__header span {
  color: white;
  padding-right: 5px;
  font-weight: 400;
  font-size: inherit;
}
.wg-cap-wrap__header span em {
  padding: 0 3px;
  font-weight: bold;
  color: #793aea;
  font-style: normal;
}
.wg-cap-wrap__header .wg-cap-wrap__image {
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  overflow: hidden;
  text-align: center;
  line-height: 1;
}
.wg-cap-wrap__header .wg-cap-wrap__thumb {
  min-width: 150px;
  text-align: center;
  line-height: 1;
  max-height: 100%;
}
.wg-cap-wrap__header .wg-cap-wrap__thumb.wg-cap-wrap__hidden {
  display: none;
}

.wg-cap-wrap__body {
  height: 240px;
  width: 300px;
  position: relative;
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  background: #34383e;
  margin: 0;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  overflow: hidden;
}
.wg-cap-wrap__body .wg-cap-wrap__picture {
  position: relative;
  z-index: 10;
  width: 100%;
  /*height: 100%;*/
  /*max-width: 100%;*/
  /*max-height: 100%;*/
  /*object-fit: cover;*/
  /*text-align: center;*/
}
.wg-cap-wrap__body .wg-cap-wrap__picture.wg-cap-wrap__hidden {
  display: none;
}
.wg-cap-wrap__body .wg-cap-wrap__loading {
  position: absolute;
  z-index: 9;
  top: 50%;
  left: 50%;
  width: 68px;
  height: 68px;
  margin-left: -34px;
  margin-top: -34px;
  line-height: 68px;
  text-align: center;
}
.wg-cap-wrap__body .wg-cap-wrap__dot {
  position: absolute;
  z-index: 10;
  width: 22px;
  height: 22px;
  color: #cedffe;
  background: #793aea;
  border: 2px solid #f7f9fb;
  line-height: 20px;
  text-align: center;
  -webkit-border-radius: 22px;
  -moz-border-radius: 22px;
  border-radius: 22px;
  cursor: default;
}

.wg-cap-wrap__footer {
  width: 100%;
  height: 40px;
  color: #34383e;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  padding-top: 15px;
}
.wg-cap-wrap__footer .wg-cap-wrap__ico {
  flex: 1;
}
.wg-cap-wrap__footer .wg-cap-wrap__ico img {
  width: 24px;
  height: 24px;
  color: #34383e;
  margin: 0 5px;
  cursor: pointer;
  opacity: 0.65;
}

.wg-cap-wrap__footer .wg-cap-wrap__ico img:hover {
  opacity: 1;
}

.wg-cap-wrap__footer .wg-cap-wrap__btn {
  width: 120px;
  height: 40px;
}
.wg-cap-wrap__footer .wg-cap-wrap__btn button {
  width: 100%;
  height: 40px;
  letter-spacing: 2px;
  text-align: center;
  padding: 9px 15px;
  font-size: 15px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  color: #fff;
  background-color: #793aea;
  border: 1px solid #793aea;
  -webkit-appearance: none;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  -moz-user-select: none;
  -webkit-user-select: none;
}
.wg-cap-wrap__footer .wg-cap-wrap__btn button:hover {
  background: rgb(105, 49, 205);
  border-color: rgb(105, 49, 205);
  color: #fff;
}
</style>
