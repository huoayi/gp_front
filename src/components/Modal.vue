<template>
  <Modal :open="visible" v-bind="attrs" @cancel="close">
    <template #title>
      <slot name="title">
        <div class="modal-title">
          <img
            class="icon icon-back hover-icon-opacity"
            src="@/assets/img/go-back.png"
            alt=""
            v-if="showBackIcon"
            @click="emit('back')"
          />
          <span class="name">{{ title }}</span>
          <img
            v-if="showCloseIcon"
            class="icon icon-close hover-icon-opacity"
            src="@/assets/img/close.png"
            alt=""
            @click="close"
          />
        </div>
      </slot>
    </template>
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { Modal } from 'ant-design-vue';
import type { ModalProps } from 'ant-design-vue/es/modal';
import { computed } from 'vue';

interface IProps {
  visible: boolean;
  width?: number | string;
  showBackIcon?: boolean;
  showCloseIcon?: boolean;
  title?: string;
  className?: string;
  customizeFooter?: boolean;
  hideTitle?: boolean;
  centered?: boolean;
  maskClosable?: boolean;
  fullModal?: boolean; // 目前只在移动端使用到
  mask?: boolean;
}
const props = withDefaults(defineProps<IProps>(), {
  width: '28.25rem',
  showBackIcon: false,
  showCloseIcon: true,
  title: '弹框标题',
  hideTitle: false,
  centered: true,
  maskClosable: true,
  mask: true,
});
const emit = defineEmits<{
  (event: 'update:visible', val: boolean): void;
  (event: 'back'): void;
  (event: 'close'): void;
}>();

const attrs = computed(() => {
  const { width, className, customizeFooter, hideTitle, centered, maskClosable, fullModal, mask } = props;
  const temp: ModalProps = {
    width,
    wrapClassName: `custom-modal ${fullModal ? 'full-modal-wrapper' : ''} ${className}`,
    centered,
    maskClosable,
    closable: false,
    mask,
  };
  if (!customizeFooter) Object.assign(temp, { footer: null });
  if (hideTitle) Object.assign(temp, { title: null });
  return temp;
});

function close() {
  emit('update:visible', false);
}
</script>

<style lang="less">
.custom-modal {
  .ant-modal {
    .ant-modal-content,
    .ant-modal-body {
      padding: 0;
    }

    .ant-modal-content {
      border-radius: 0.375rem;
    }
  }

  .modal-title {
    position: relative;
    padding: 1rem 1.25rem;
    width: 100%;
    height: 3.75rem;

    .name {
      display: inline-block;
      width: 100%;
      height: 1.75rem;
      font-size: 1.25rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.75rem;
      text-align: center;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 0.0625rem;
      background: #ffffff;
      opacity: 0.1;
    }

    .icon {
      position: absolute;
      top: 50%;
      left: 1.5rem;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      cursor: pointer;

      &.icon-close {
        left: auto;
        right: 1.5rem;
      }
    }
  }

  .modal-content {
    padding: 1rem 1.375rem 1.875rem;

    // 默认 form item 的 margin-bottom 为 1.125rem;
    .ant-form-item {
      margin-bottom: 1.125rem;
    }
  }
}

.is-mobile {
  .custom-modal {
    .modal-title {
      padding: 0.6875rem 1rem;
      height: 2.875rem;

      .name {
        height: 1.375rem;
        font-size: 1rem;
        line-height: 1.375rem;
      }

      .icon {
        left: 1rem;
        width: 0.75rem;
        height: 0.75rem;

        &-close {
          left: auto;
          right: 1rem;
          width: 0.875rem;
          height: 0.875rem;
        }
      }
    }

    .modal-content {
      padding: 0.75rem 1rem 1.25rem;

      .ant-form-item {
        margin-bottom: 1rem;
      }

      button {
        font-size: 0.875rem;
      }
    }
  }
}

.full-modal-wrapper {
  // 全屏、背景
  .ant-modal {
    height: 100%;
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
    background: #141416;

    .ant-modal-content {
      height: calc(100vh);
      background: inherit;
      overflow-y: auto;
    }

    .ant-modal-body {
      flex: 1;
      height: calc(100% - 46px);
    }

    .ant-modal-header {
      position: sticky;
      top: 0;
      background: inherit;
      z-index: 200;
    }
  }
}
</style>
