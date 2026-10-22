export function definirRotaInicial(ehAdministrador, ehFuncionario) {
    if(ehAdministrador) {
        return "/admin";
    }

    if(ehFuncionario) {
        return "/admin";
    }

    return "/";
}