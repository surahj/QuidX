import { Transform } from 'class-transformer';

export function RemoveQuotes(): PropertyDecorator {
  return Transform((value) => {
    const str = value.value as string;
    return str.split(/\s+/g).join(' ').replace(/['"]/g, '');
  });
}
