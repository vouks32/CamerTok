import { StyleSheet } from 'react-native';

// Styles constants réutilisables
export const constantStyles = StyleSheet.create({
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputField: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badge:{
    padding : 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  roleBadge:{
    width : 35,
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

// Styles dynamiques basés sur le thème
export const dynamicStyles = (theme) => StyleSheet.create({
  // ========== STRUCTURE ==========
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 40
  },
  screenContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: theme.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  section: {
    marginVertical: 10,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: theme.cardBackground,
    marginBottom: 15,
    marginHorizontal: 5,
    justifyContent: 'space-between',
    ...constantStyles.cardShadow,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 15,
    width: '85%',
    backgroundColor: theme.cardBackground,
    ...constantStyles.cardShadow,
  },

  // ========== TYPOGRAPHY ==========
  title: {
    fontSize: 24,
    color: theme.text,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    fontSize: 22,
    color: theme.text,
    textAlign: 'center',
    marginVertical: 15,
    fontWeight: 'bold',
  },
  text: {
    color: theme.text,
    fontSize: 16,
  },
  secondaryText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  sectionTitle: {
    color: theme.textSecondary,
    marginBottom: 10,
    fontWeight: '600',
    marginLeft: 10
  },
  modalTitle: {
    fontSize: 20,
    color: theme.text,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  moneyValue: {
    color: theme.secondary,
    fontWeight: 'bold',
    fontSize: 22,
  },
  dangerText: {
    color: theme.danger,
    fontSize: 20,
    fontWeight: 'bold',
  },

  // ========== FORM ELEMENTS ==========
  input: {
    ...constantStyles.inputField,
    backgroundColor: theme.inputBackground || theme.cardBackground,
    borderColor: theme.inputBorder || theme.inactiveTint,
    color: theme.text,
  },
  primaryButton: {
    ...constantStyles.button,
    backgroundColor: theme.primary,
  },
  secondaryButton: {
    ...constantStyles.button,
    backgroundColor: theme.secondary,
  },
  accentButton: {
    ...constantStyles.button,
    backgroundColor: theme.accent,
  },
  dangerButton: {
    ...constantStyles.button,
    backgroundColor: theme.danger,
  },
  successButton: {
    ...constantStyles.button,
    backgroundColor: theme.success,
  },
  disabledButton: {
    ...constantStyles.button,
    backgroundColor: theme.inactiveTint,
  },
  sendButton: {
    ...constantStyles.button,
    backgroundColor: theme.inactiveTint,
  },

  // ========== STATUS BARS ==========
  barContainer: {
    marginBottom: 12,
  },
  barBackground: {
    height: 20,
    backgroundColor: theme.inactiveTint,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    height: '100%',
    position: 'absolute',
  },
  barText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: theme.text,
  },

  // ========== ACTIVITY POINTS ==========
  pointsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  point: {
    width: "20%",
    aspectRatio: 1,
    borderRadius: 50,
    marginRight: 10,
  },

  // ========== CHAT ==========
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  messageBubble: {
    maxWidth: '65%',
    padding: 12,
    borderRadius: 15,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  username : {
    fontSize: 11,
    opacity : 0.7
  },

  chatInputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: theme.inactiveTint,
    backgroundColor: theme.cardBackground,
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: theme.inputBackground || theme.background,
    color: theme.text,
  },

  // ========== MARKET ==========
  adCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: theme.cardBackground,
    ...constantStyles.cardShadow,
  },
  adTitle: {
    fontSize: 18,
    color: theme.text,
    marginBottom: 5,
    fontWeight: '600',
  },
  adPrice: {
    color: theme.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  adSeller: {
    color: theme.textSecondary,
    marginBottom: 3,
  },
  adType: {
    color: theme.primary,
    marginTop: 5,
    fontWeight: '600',
  },

  // ========== INVENTORY ==========
  itemName: {
    fontSize: 18,
    color: theme.text,
    marginBottom: 5,
    fontWeight: '600',
  },
  itemEffect: {
    color: theme.textSecondary,
    marginBottom: 3,
  },
  itemCost: {
    marginBottom: 0,
    fontWeight: '500',
  },
  itemCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: theme.cardBackground,
    ...constantStyles.cardShadow,
  },

  // ========== LOGIN SCREEN ==========
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    ...constantStyles.cardShadow,
  },
  profileImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 75,
  },
  addPhotoText: {
    color: theme.textSecondary,
    marginTop: 5,
  },
  // MAP //
  fullMap: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  inventoryList: {
    paddingVertical: 10,
  },
  inventoryCard: {
    width: 150,
    marginRight: 15,
    padding: 10,
  },
});

// Combinaison de tous les styles
export const globalStyles = (theme) => ({
  ...constantStyles,
  ...dynamicStyles(theme),
});