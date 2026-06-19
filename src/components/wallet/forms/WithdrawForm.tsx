import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Card } from '@/src/components/ui/card/Card';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import TarjetaIcon from '@/assets/icons/SVG/Tarjeta.svg';
import { FormField, SelectBottomSheet } from '@/src/components/ui/input';
import { AddAccountModal } from '@/src/components/wallet/modals/AddAccountModal';
import { DeleteConfirmationModal } from '@/src/components/wallet/modals/DeleteConfirmationModal';
import { UserAccount, GetUserAccounts } from '@/src/types/user-account';
import { getAllBankAccounts, deleteBankAccount } from '@/src/services/account.service';
import { authStore } from '@/src/store/auth.store';
import { useBlockchainConfigStore } from '@/src/store/blockchainConfig.store';
import OperationStatusModal from '../OperationStatusModal';
import { formatColombianPesos, parseCopAmountFromText } from '@/src/utils/formatCurrency';
import { Alert } from 'react-native';
import { withdrawAccount } from '@/src/services/finance.service';
import { getPrivateKey } from '@/src/services/auth.service';
import { CreateRechargeDto } from '@/src/types/finance.types';

import { LeasingTokenService } from '@/src/components/wallet/contracts/services/leasing-token.service';

/**
 * Withdraw form - UI complete but functionality disabled
 */
export const WithdrawForm = ({ setIsModalVisible }: { setIsModalVisible: (visible: boolean) => void }) => {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [isAddAccountModalVisible, setIsAddAccountModalVisible] = useState(false);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [bankAccounts, setBankAccounts] = useState<GetUserAccounts[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<GetUserAccounts | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isOperationStatusModalVisible, setIsOperationStatusModalVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [showWithdrawConfirmationModal, setShowWithdrawConfirmationModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isWithdrown, setIsWithdrown] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  const { user, balance } = authStore();

  useEffect(() => {
    fetchBankAccounts();
  }, [user]);

  const validateAmount = (amountValue: string): string | null => {
    const digits = String(amountValue ?? "").replace(/\D/g, "");
    const numericAmount = digits ? Number.parseInt(digits, 10) : 0;
    const currentBalance = parseCopAmountFromText(balance ?? "0");

    if (!digits || numericAmount <= 0) {
      return null;
    }

    if (numericAmount < 100_000) {
      return "El monto mínimo de retiro es de $100.000 COP";
    }

    if (numericAmount > currentBalance) {
      return `El monto no puede exceder tu saldo disponible: $${formatColombianPesos(String(currentBalance))}`;
    }

    return null;
  };

  const handleAmountChange = (value: string) => {
    // Remove all non-digit characters to get clean number
    const unformatted = value.replace(/\D/g, '');
    setAmount(unformatted);

    // Validate amount and set error
    const error = validateAmount(unformatted);
    setAmountError(error);
  };

  const isFormValid = () => {
    const amountNum = amount ? Number.parseInt(String(amount).replace(/\D/g, ""), 10) : 0;
    const balanceNum = parseCopAmountFromText(balance ?? "0");
    return (
      Boolean(amount) &&
      Boolean(bankAccount) &&
      !amountError &&
      amountNum >= 100_000 &&
      amountNum <= balanceNum
    );
  };

  const handleWithdraw = () => {
    if (!amount || !bankAccount) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const error = validateAmount(amount);
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setShowWithdrawConfirmationModal(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!user?.id || !user?.email || !amount || !bankAccount) return;

    const amountCop = Number.parseInt(String(amount).replace(/\D/g, ""), 10);
    if (!Number.isFinite(amountCop) || amountCop <= 0) {
      Alert.alert("Error", "Monto no válido.");
      return;
    }

    try {
      setIsWithdrawing(true);

      const selectedAccount = selectedBankAccount();
      let txHash = "";

      /** Clave en store o recuperada del almacenamiento seguro local. */
      let signingKey = authStore.getState().privateKey;
      if (!signingKey) {
        signingKey = await getPrivateKey();
        if (signingKey) {
          authStore.getState().setPrivateKey(signingKey);
        }
      }

      // Transferencia on-chain de los tokens al Treasury de Brickle (PaymentWalletAddress) si hay clave.
      if (signingKey) {
        const { baseToken: usdcAddress } = await useBlockchainConfigStore.getState().fetchConfig();
        if (!usdcAddress) {
          Alert.alert("Error", "No se encontró la dirección del contrato del token.");
          return;
        }

        const tokenService = new LeasingTokenService(usdcAddress);
        const amountToTransfer = await tokenService.parseTokenAmount(amount);
        const BRICKLE_TREASURY_ADDRESS = '0xB818f59e7D46b5F17CfE66ef42cd01155a052e7C';
        console.log(`Transferring ${amount} to treasury (${BRICKLE_TREASURY_ADDRESS}) ...`);
        
        try {
          const transferReceipt = await tokenService.transfer(BRICKLE_TREASURY_ADDRESS, amountToTransfer, signingKey);
          if (!transferReceipt) {
            throw new Error("Transfer transaction failed");
          }
          console.log("Transfer successful:", transferReceipt.hash);
          txHash = transferReceipt.hash;
        } catch (txError) {
          console.error("Transfer transaction failed:", txError);
          Alert.alert(
            "Error de Transacción",
            "No se pudieron debitar los tokens de tu billetera. Asegúrate de contar con saldo suficiente y MATIC para el gas de red (Polygon)."
          );
          return;
        }
      } else {
        console.warn(
          "WithdrawForm: retiro sin transferencia on-chain en cliente (sin llave); solo solicitud al servidor."
        );
      }

      const reference = selectedAccount 
        ? `Retiro a ${selectedAccount.bankName}${txHash ? ` - Tx: ${txHash.substring(0, 8)}...` : ''}` 
        : `Retiro${txHash ? ` - Tx: ${txHash.substring(0, 8)}...` : ''}`;

      const withdrawData = {
        userId: user.id,
        amount: amountCop,
        reference,
      };

      const withdrawResponse = await withdrawAccount(user.email, withdrawData);

      if (withdrawResponse) {
        setShowWithdrawConfirmationModal(false);
        setIsWithdrown(true);

        setAmount("");
        setBankAccount("");
      } else if (signingKey) {
        Alert.alert(
          "Error",
          "No se pudo registrar el retiro en el servidor, pero los tokens fueron transferidos. Por favor contacta soporte."
        );
      } else {
        Alert.alert("Error", "No se pudo procesar el retiro. Inténtalo de nuevo o contacta soporte.");
      }
    } catch (error) {
      Alert.alert("Error", "Error al procesar el retiro. Inténtalo de nuevo.");
      console.error("Withdraw error:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAddAccount = () => {
    setIsAddAccountModalVisible(true);
  };

  const handleAccountAdded = (account: UserAccount) => {
    setUserAccounts(prev => [...prev, account]);
    setIsOperationStatusModalVisible(true);
    // Refresh bank accounts after adding new one
    fetchBankAccounts();
  };

  const fetchBankAccounts = async () => {
    if (!user?.email || !user?.id) {
      console.log('User not available for fetching accounts');
      setIsLoadingAccounts(false);
      return;
    }

    try {
      setIsLoadingAccounts(true);
      const accounts = await getAllBankAccounts(user.email, user.id);
      if (accounts) {
        setBankAccounts(Array.isArray(accounts) ? accounts : [accounts]);
      } else {
        setBankAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setBankAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleDeleteAccountPress = (account: GetUserAccounts) => {
    setAccountToDelete(account);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete || !user?.email) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      await deleteBankAccount(user.email, accountToDelete.id);

      // Remove the account from local state
      setBankAccounts(prev => prev.filter(account => account.id !== accountToDelete.id));

      // Close modal and reset state
      setIsDeleteModalVisible(false);
      setAccountToDelete(null);
      setIsDeleteVisible(true);

    } catch (error) {
      console.error('Error deleting account:', error);
      // Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta nuevamente.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setAccountToDelete(null);
  };

  const selectedBankAccount = useCallback(() => {
    const account = bankAccounts?.find((account) => account.id === bankAccount)
    return account;
  }, [bankAccount])

  return (
    <Card className="mb-6 p-4" style={{ backgroundColor: 'transparent' }}>
      <Text className="text-xl font-libre-bold mb-4">Retirar</Text>

      <View className="bg-white rounded-lg p-4 mb-12">
        <View className="mb-6">
          <FormField
            width='w-full'
            label="Ingrese el monto a retirar"
            description={`Saldo disponible: $${formatColombianPesos(balance || '0')} • Mínimo: $100.000`}
            placeholder="0.00"
            value={formatColombianPesos(amount)}
            onChangeText={handleAmountChange}
            icon={<MaterialIcons name="attach-money" size={24} color="#666" />}
            error={amountError || undefined}
            containerClassName='w-full'
            keyboardType="numeric"
          />
        </View>

        <View className="mb-6">
          <SelectBottomSheet
            label="Seleccione la cuenta"
            value={bankAccount}
            options={bankAccounts.map(account => ({
              label: `${account.bankName} - ${account.maskedAccountNumber}`,
              value: account.id
            }))}
            onValueChange={(value) => setBankAccount(value.toString())}
            emptyListAction={
              !isLoadingAccounts && bankAccounts.length === 0
                ? {
                    label: "Crear cuenta",
                    onPress: () => {
                      setTimeout(() => setIsAddAccountModalVisible(true), 450);
                    },
                  }
                : undefined
            }
          />
        </View>

        <TouchableOpacity
          className={`py-3 rounded-full ${isFormValid() && !isWithdrawing
            ? 'bg-green-primary'
            : 'bg-gray-300'
            }`}
          onPress={handleWithdraw}
          disabled={!isFormValid() || isWithdrawing}
        >
          <Text className={`text-center font-libre-bold ${isFormValid() && !isWithdrawing
            ? 'text-blue-primary'
            : 'text-gray-500'
            }`}>
            {isWithdrawing ? 'Procesando...' : 'Retirar ahora'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-xl font-libre-bold mb-4">Cuentas</Text>

      <View className="bg-white rounded-lg p-4">
        {isLoadingAccounts ? (
          <View className="py-8 items-center">
            <Text className="text-gray-500">Cargando cuentas...</Text>
          </View>
        ) : bankAccounts.length > 0 ? (
          bankAccounts.map((account: GetUserAccounts, index: number) => (
            <View
              key={account.id}
              className={`flex-row items-center justify-between p-4 border border-gray-200 rounded-lg ${index < bankAccounts.length - 1 ? 'mb-6' : ''}`}
            >
              <View className="flex-row items-center flex-1">
                <View className="mr-4">
                  <TarjetaIcon width={24} height={24} />
                </View>
                <View>
                  <Text className="text-base font-libre-regular">{account.bankName}</Text>
                  <Text className="text-sm text-gray-500">{account.maskedAccountNumber}</Text>
                  <Text className="text-xs text-gray-400">{account.accountHolder}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteAccountPress(account)}
                className="w-10 h-10 bg-red-500 rounded-full items-center justify-center shadow-sm"
                style={{ elevation: 2 }}
              >
                <Ionicons name="trash-outline" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="py-8 items-center">
            <Text className="text-gray-500 text-center mb-2">No tienes cuentas registradas</Text>
            <Text className="text-gray-400 text-center text-sm">Agrega una cuenta para poder realizar retiros</Text>
          </View>
        )}

        <TouchableOpacity
          className="mt-6 items-center justify-center bg-orange-primary py-3 rounded-full"
          onPress={handleAddAccount}
        >
          <Text className="text-white font-libre-bold">Agregar cuenta</Text>
        </TouchableOpacity>
      </View>

      <AddAccountModal
        isVisible={isAddAccountModalVisible}
        onClose={() => setIsAddAccountModalVisible(false)}
        onAccountAdded={handleAccountAdded}
      />

      <OperationStatusModal
        isVisible={isOperationStatusModalVisible}
        title='Cuenta agregada'
        type='success'
        onClose={() => setIsOperationStatusModalVisible(false)}
      />

      <OperationStatusModal
        isVisible={isDeleteVisible}
        title='Cuenta eliminada'
        type='success'
        onClose={() => setIsDeleteVisible(false)}
      />

      <OperationStatusModal
        isVisible={isWithdrown}
        title='Solicitud de retiro enviada'
        type='success'
        onClose={() => setIsWithdrown(false)}
      />

      <DeleteConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar cuenta bancaria"
        message={`¿Estás seguro de que deseas eliminar la cuenta de ${accountToDelete?.bankName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar cuenta"
        isLoading={isDeletingAccount}
      />

      {/* Withdraw Confirmation Modal */}
      <Modal
        animationType="fade"
        visible={showWithdrawConfirmationModal}
        onRequestClose={() => setShowWithdrawConfirmationModal(false)}
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl m-4 p-6 w-[85%]">
            <Text className="text-xl font-libre-bold text-center mb-4">Confirmar Retiro</Text>

            <View className="mb-6">
              <Text className="text-base text-gray-600 text-center mb-2">
                ¿Estás seguro de que deseas retirar?
              </Text>
              <Text className="text-2xl font-libre-bold text-center text-green-600 mb-2">
                ${formatColombianPesos(amount)}
              </Text>
              <Text className='text-sm text-secondary font-libre-bold text-center'>Cuenta: {selectedBankAccount()?.bankName}</Text>
              <Text className="text-sm text-secondary text-center">
                Esta operación será procesada y no se puede deshacer.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 bg-gray-200 rounded-full"
                onPress={() => setShowWithdrawConfirmationModal(false)}
                disabled={isWithdrawing}
              >
                <Text className="text-center font-libre-bold text-gray-700">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-full ${isWithdrawing ? 'bg-green-300' : 'bg-green-primary'
                  }`}
                onPress={handleConfirmWithdraw}
                disabled={isWithdrawing}
              >
                <Text className="text-center font-libre-bold text-blue-primary">
                  {isWithdrawing ? 'Procesando...' : 'Confirmar Retiro'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
}; 