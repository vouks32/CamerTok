import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const Toast = ({ 
  title, 
  body, 
  list = [],
  duration = 3000, 
  buttons = [], 
  onClose 
}) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Slide in
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    // Auto dismiss
    if (duration) {
      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onClose?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      {list.map(l=>(
      <Text style={styles.body}>  • {l}</Text>
      ))}

      {buttons.length > 0 && (
        <View style={styles.buttonRow}>
          {buttons.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.button}
              onPress={() => {
                btn.onPress?.();
                handleClose();
              }}
            >
              <Text style={styles.buttonText}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 100,
    right: width * 0.1,
    width: width * 0.8,
    backgroundColor: "#fffd",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: "#555",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: {
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e91e63",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default Toast;
