const modules = import.meta.glob(['./*.webp', './*.png', './*.jpeg', './*.jpg'], { eager: true });

const images: { [name: string]: any } = {};

for (let key in modules) {
  let name = key.replace(/(\.\/|\.(webp|png|jpeg|jpg))/g, '');
  images[name] = (modules[key] as any).default;
}

export { images };
