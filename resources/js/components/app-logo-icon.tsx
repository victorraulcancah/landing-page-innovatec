import { ImgHTMLAttributes } from 'react';

/** Símbolo de UCO360 (recortado del brochure del cliente). */
export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/brand/uco360-icon.png" alt="" className={className} {...props} />;
}
