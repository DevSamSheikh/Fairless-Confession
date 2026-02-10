import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";

interface SearchBarProps {
  isVisible: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isVisible,
  onClose,
  query,
  onQueryChange,
  placeholder = "Search confessions...",
}) => {
  if (!isVisible) return null;

  return (
    <View style={styles.searchBarContainer}>
      <TouchableOpacity onPress={onClose} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#8E9196"
        autoFocus
        value={query}
        onChangeText={onQueryChange}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => onQueryChange("")} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#8E9196" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E222B",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  backButton: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginLeft: 5,
  },
  clearButton: {
    marginLeft: 5,
  },
});
