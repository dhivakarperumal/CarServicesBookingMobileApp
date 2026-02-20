import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const className = 
    type === 'default' ? 'text-base leading-6' :
    type === 'title' ? 'text-3xl font-bold leading-8' :
    type === 'defaultSemiBold' ? 'text-base font-semibold leading-6' :
    type === 'subtitle' ? 'text-xl font-bold' :
    type === 'link' ? 'text-base leading-7 text-blue-700' :
    'text-base leading-6';

  return (
    <Text
      className={className}
      style={[{ color }, style]}
      {...rest}
    />
  );
}
