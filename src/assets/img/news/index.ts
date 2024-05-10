const modules = import.meta.glob('./*.png', { eager: true });

const images: { [name: string]: string } = {};

for (let key in modules) {
  images[key.replace(/(\.\/|\.png)/g, '')] = (modules[key] as any).default;
}

export { images };
