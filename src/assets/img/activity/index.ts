const modules = import.meta.glob(['./*/*.webp', './*/*.png', './*/*.jpg'], { eager: true });

const images: { [name: string]: any } = {};

for (let key in modules) {
  let name = key.replace(/(\.\/|\.(webp|png|jpg))/g, '');
  images[name] = (modules[key] as any).default;
}

export { images };
