import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/Logo.png")} style={styles.logo} />
      
      <Text style={styles.title}>Elevate Your Game</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.PGAButtonWrapper]}
          onPress={() => navigation.navigate("Auth", { userType: "PGA" })}
        >
          <Text style={styles.buttonText}>PGA Pro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonWrapper, styles.GolferButtonWrapper]}
          onPress={() => navigation.navigate("GolferAuth")}
        >
          <Text style={styles.buttonText}>Golfer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    height: 60,
    width: 180,
    marginVertical: 20,
  },
 
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  PGAButtonWrapper: {
    backgroundColor: '#007f00',
  },
  GolferButtonWrapper: {
    backgroundColor: '#004d00',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

//code adapted from Zero Degree Coder Signup,Login,welcome Screen react native video
//https://www.youtube.com/watch?v=eu-8OlWbwjA