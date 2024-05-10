const modules = import.meta.glob(['./*.webp', './*.png'], { eager: true });

const images: { [name: string]: any } = {};

for (let key in modules) {
  let name = key.replace(/(\.\/|\.(webp|png))/g, '');
  images[name] = (modules[key] as any).default;
}

export default images;
