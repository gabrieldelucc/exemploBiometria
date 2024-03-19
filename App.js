import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";

import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import moment from "moment";

export default function App() {
  // salvar a referência de suporte a biometria
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  //salvar o estado de autenticado
  const [authenticated, setAuthenticated] = useState(false);

  const [dateHistory, setDateHistory] = useState({});

  // Função para verificar se existe a Biometria no aparelho
  async function CheckExistAuthentications() {
    const compatible = await LocalAuthentication.hasHardwareAsync();

    //Salvando o status de compatibilidade com a biometria
    setIsBiometricSupported(compatible);
  }

  async function SetHistory() {
    {
      const objAuth = {
        dataAuthentication: moment().format("DD/MM/YYYY"),
      };
    }
    await AsyncStorage.setItem("authenticate", JSON.stringify(objAuth));

    setDateHistory(objAuth);
  }

  async function GetHistory() {
    const objAuth = await AsyncStorage.getItem("authenticate");

    if (objAuth) {
      setDateHistory(JSON.parse(objAuth));
    }
  }

  async function handleAuthentication() {
    // verificar se existe uma Biometria Cadastrada
    const biometricExist = await LocalAuthentication.isEnrolledAsync();

    if (!biometricExist) {
      return Alert.alert(
        "Falha ao logar",
        "Não foi encontrada nenhuma biometria cadastrada"
      );
    }

    //Caso exista -->
    const auth = await LocalAuthentication.authenticateAsync();

    setAuthenticated(auth.success);

    if (auth.success) {
      SetHistory();
    }
  }

  useEffect(() => {
    CheckExistAuthentications();

    GetHistory(); //Buscando a última autenticação
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isBiometricSupported
          ? " o seu dispositivo é compatível com a Biometria"
          : " o seu dispositivo não suporta a biometria / Face Id"}
      </Text>
      <TouchableOpacity
        onPress={() => handleAuthentication()}
        style={styles.btnAuth}
      >
        <Text style={styles.txtAuth}>Autenticar Acesso</Text>
      </TouchableOpacity>

      <Text
        style={[styles.txtReturn, { color: authenticated ? "green" : "red" }]}
      >
        {authenticated ? "Autenticado" : "Não Autenticado"}
      </Text>

      {dateHistory.dataAuthentication ? (
        <Text style={styles.txtHistory}>
          Ultimo Acesso em {dateHistory.dataAuthentication}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    width: "70%",
    alignItems: "center",
    lineHeight: 30,
  },

  btnAuth: {
    padding: 16,
    borderRadius: 10,
    margin: 10,
    backgroundColor: "#ff8800",
  },
  txtAuth: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },

  txtReturn: {
    fontSize: 22,
    marginTop: 50,
  },

  txtHistory: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#858383",
    position: "absolute",
    bottom: 120,
  },
});
