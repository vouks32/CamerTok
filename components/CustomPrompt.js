import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

const CustomPrompt = ({
  visible = false,
  title = "Enter Input",
  message = "Please provide the required information:",
  placeholder = "Écrivez ici...",
  initialValue = "",
  onSubmit,
  onCancel,
  cancelText = "Cancel",
  submitText = "Submit",
  inputMode = "text", // 'text' (default) or 'numeric'
  themeColor = '#FF0050', // Primary color for actions
  showValidation = true,
  validationMessage = "veillez entrer l'information",
  keyboardType = 'default' // Supports: 'default', 'numeric', 'email-address', etc.
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);

  // Handle modal visibility changes and reset state
  const handleModalShow = () => {
    setInputValue(initialValue);
    setIsValid(true);
  };

  const handleSubmit = () => {
    if (showValidation && (!inputValue.trim() || inputValue.trim().length < 5) ) {
      setIsValid(false);
      return;
    }

    if (onSubmit) {
      onSubmit(inputValue);
    }
    // Optionally clear input on submit
     setInputValue('');
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setIsValid(true);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onShow={handleModalShow}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}

            <TextInput
              style={[styles.input, !isValid && styles.inputError]}
              value={inputValue}
              onChangeText={(text) => {
                setInputValue(text);
                if (showValidation && !isValid) {
                  setIsValid(true); // Clear error when user starts typing
                }
              }}
              placeholder={placeholder}
              placeholderTextColor="#999"
              autoFocus={true}
              keyboardType={keyboardType}
              autoCapitalize="none"
              autoCorrect={false}
              // Multiline can be configured via props if needed
            />

            {showValidation && !isValid && (
              <Text style={styles.validationText}>{validationMessage}</Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: '#555' }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, { backgroundColor: themeColor }]}
                onPress={handleSubmit}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>
                  {submitText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400, // Better for tablets/web
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  message: {
    fontSize: 14,
    marginBottom: 16,
    color: '#666',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  validationText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor : '#FF3B30'
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    // Color is set inline via themeColor prop
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
  },
});

export default CustomPrompt;