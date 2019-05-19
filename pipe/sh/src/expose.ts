export default function expose(content: string): string {
  // Expose packages
  const regex = /\$packages =[^;]+;/;
  const found = regex.exec(content);
  if (!found) throw Error('$packages not found');

  return content.replace(
    regex,
    found[0] + '\n$module.exports.packages = $packages;'
  );
}
