import { useRouter } from "next/router";
import Link, { LinkProps } from "next/link";
import { ReactElement, cloneElement } from "react";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export function ActiveLink({
  children,
  activeClassName,
  ...rest
}: ActiveLinkProps) {
  // asPath retorna a rota atual
  const { asPath } = useRouter();

  const className = asPath === rest.href ? activeClassName : "";
  return (
    <Link {...rest}>
      {/* clona o elemento recebido, passando as propriedades desejadas. Neste caso, o classsname */}
      {cloneElement(children, { className })}
    </Link>
  );
}
