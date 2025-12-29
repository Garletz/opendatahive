import { ReactNode } from 'react';
import {
  FirebaseProvider,
  AuthProvider,
  InteractionProvider,
  HiveProvider,
  SearchProvider,
  ModalProvider,
  GunProvider
} from '@/context';







interface RootProvidersProps {
  children: ReactNode;
}

const RootProviders = ({ children }: RootProvidersProps) => (
  <FirebaseProvider>
    <AuthProvider>
      <InteractionProvider>
        <HiveProvider>
          <SearchProvider>
            <ModalProvider>
              <GunProvider>{children}</GunProvider>
            </ModalProvider>
          </SearchProvider>
        </HiveProvider>
      </InteractionProvider>
    </AuthProvider>
  </FirebaseProvider>
);

export default RootProviders;
