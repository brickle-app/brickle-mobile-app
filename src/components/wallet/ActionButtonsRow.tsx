import React from 'react';
import { View } from 'react-native';
import { IconButton } from '../ui/button/IconButton';
import EnviarIcon from '@/assets/icons/SVG/Enviar.svg';
import RecargarIcon from '@/assets/icons/SVG/Recargar.svg';
import RetirarIcon from '@/assets/icons/SVG/Retirar.svg';
import MovimientosIcon from '@/assets/icons/SVG/Movimientos.svg';

// Importar tipo de tab
import { WalletTabType } from './WalletTabs';

interface ActionButtonsRowProps {
  activeTab: WalletTabType;
  onSend?: () => void;
  onRecharge?: () => void;
  onWithdraw?: () => void;
  onTransactions?: () => void;
}

/**
 * Componente que muestra una fila de botones de acción para la wallet
 */
export const ActionButtonsRow = ({
  activeTab,
  onSend,
  onRecharge,
  onWithdraw,
  onTransactions,
}: ActionButtonsRowProps) => {
  // Contraste de referencia: fondo oscuro + icono/texto verde claro (la página no usa aún estos colores)
  const buttonBg = (tab: WalletTabType) =>
    activeTab === tab
      ? "bg-wallet-button-bg border-2 border-wallet-icon-green"
      : "bg-wallet-button-bg";
  const labelColor = "text-wallet-icon-green";

  return (
    <View className="flex-row h- mb-4 justify-center rounded-xl py-4 px-2 gap-4">
      <IconButton
        icon={<RecargarIcon width={52} height={52} />}
        label="Recargar"
        onPress={onRecharge}
        classNameView={`h-24 w-24 rounded-xl ${buttonBg("recharge")}`}
        labelClassName={labelColor}
        iconClassName="mb-1"
      />
      <IconButton
        icon={<RetirarIcon width={52} height={52} />}
        label="Retirar"
        onPress={onWithdraw}
        classNameView={`h-24 w-24 rounded-xl ${buttonBg("withdraw")}`}
        labelClassName={labelColor}
        iconClassName="mb-1"
      />
      <IconButton
        icon={<EnviarIcon width={52} height={52} />}
        label="Enviar"
        onPress={onSend}
        classNameView={`h-24 w-24 rounded-xl ${buttonBg("send")}`}
        labelClassName={labelColor}
        iconClassName="mb-1"
        disabled={true}
      />
      <IconButton
        icon={<MovimientosIcon width={52} height={52} />}
        label="Movimientos"
        onPress={onTransactions}
        classNameView={`h-24 w-24 rounded-xl ${buttonBg("transactions")}`}
        labelClassName={labelColor}
        iconClassName="mb-1"
      />
    </View>
  );
}; 