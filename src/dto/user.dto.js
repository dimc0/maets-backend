// on ne renvoie jamais le hash du mot de passe
export function toUserDto(user) {
  return {
    id: user.id,
    email: user.email,
    roles: user.Roles.map((role) => role.name),
  };
}
