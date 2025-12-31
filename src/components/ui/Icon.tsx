import { icons } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { memo, useMemo } from 'react';

type IconName = keyof typeof icons;
type IconProps = { name: IconName; className?: string };

const Icon: React.FC<IconProps> = memo(({ name, className }) => {
  const CustomIcon = useMemo(() => {
    const Icon = icons[name];

    if (!Icon) {
      console.warn(`Icon "${name}" not found in lucide-react-native`);
      return null;
    }

    return cssInterop(Icon, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
          width: true,
          height: true,
        },
      },
    });
  }, [name]);

  if (!CustomIcon) return null;

  return <CustomIcon className={className} />;
});

export default Icon;
