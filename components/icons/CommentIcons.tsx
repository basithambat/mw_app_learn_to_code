import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    opacity?: number;
}

export const LikeIcon: React.FC<IconProps> = ({ size = 20, color = "black", opacity = 0.6 }) => (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path
            d="M12.357 12.3573C11.0553 13.6591 8.94472 13.6591 7.64298 12.3573M7.70833 7.91699V7.90866M12.2917 7.91699V7.90866M15.8333 1.66699V6.66699M13.3333 4.16699H18.3333M9.16667 2.54649C7.53366 2.728 5.94888 3.44485 4.6967 4.69703C1.76777 7.62594 1.76777 12.3747 4.6967 15.3036C7.62562 18.2325 12.3743 18.2325 15.3033 15.3036C16.5555 14.0514 17.2723 12.4667 17.4538 10.8337M7.91667 7.91699C7.91667 8.14711 7.82339 8.33366 7.70833 8.33366C7.59327 8.33366 7.5 8.14711 7.5 7.91699C7.5 7.68687 7.59327 7.50033 7.70833 7.50033C7.82339 7.50033 7.91667 7.68687 7.91667 7.91699ZM12.5 7.91699C12.5 8.14711 12.4067 8.33366 12.2917 8.33366C12.1766 8.33366 12.0833 8.14711 12.0833 7.91699C12.0833 7.68687 12.1766 7.50033 12.2917 7.50033C12.4067 7.50033 12.5 7.68687 12.5 7.91699Z"
            stroke={color}
            strokeOpacity={opacity}
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ReplyIcon: React.FC<IconProps> = ({ size = 20, color = "black", opacity = 0.6 }) => (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path
            d="M5.8335 2.5L3.3335 5L5.8335 7.5M4.16683 5H11.2502C14.2417 5 16.6668 7.42512 16.6668 10.4167C16.6668 13.4082 14.2417 15.8333 11.2502 15.8333C8.25862 15.8333 6.50012 12.5 6.50012 12.5"
            stroke={color}
            strokeOpacity={opacity}
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
