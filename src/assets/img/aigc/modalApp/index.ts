const modules = import.meta.glob('./*.png', { eager: true });

const modalAppImg: { [name: string]: string } = {};

for (let key in modules) {
  modalAppImg[key.replace(/(\.\/|\.png)/g, '')] = (modules[key] as any).default;
}

export { modalAppImg };
