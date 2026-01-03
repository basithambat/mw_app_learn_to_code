
import React from "react";
import { View, StyleSheet } from "react-native";
import Content from "./Content";

const AppGradient = ({
    children,
    colors,
}: {
    children: any;
    colors: string[];
}) => {
    return (
        <View  className="flex-1">
            <Content>{children}</Content>
        </View>
    );
};

export default AppGradient;