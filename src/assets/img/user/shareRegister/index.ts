const modules = import.meta.glob('./*.png', { eager: true });

const icons: { [name: string]: any } = {};

for (let key in modules) {
  let name = key.replace(/(\.\/|\.png)/g, '');
  icons[name] = (modules[key] as any).default;
}

export { icons };
