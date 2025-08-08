// App.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import Onboarding from './screens/Onboarding';
import ProfilePickerModal from './components/ProfilePickerModal';
import * as ProfileService from './services/ProfileService';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [showPicker, setShowPicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await ProfileService.getProfiles();
      setProfiles(list);
      const sel = await ProfileService.getSelectedProfileId();
      if (!list || list.length === 0) setShowOnboarding(true);
      else if (!sel) setShowPicker(true);
      setSelectedId(sel);
      setLoading(false);
    })();
  }, []);

  const reloadProfiles = async () => {
    const list = await ProfileService.getProfiles();
    setProfiles(list);
    return list;
  };

  const handleCreated = async (profile) => {
    await ProfileService.setSelectedProfileId(profile.id);
    await reloadProfiles();
    setSelectedId(profile.id);
    setShowOnboarding(false);
    setShowPicker(false);
  };

  const handleCancelOnboarding = async () => {
    setShowOnboarding(false);
    const list = await reloadProfiles();
    if (!selectedId && list.length > 0) setShowPicker(true);
  };

  const handleSelect = async (id) => {
    await ProfileService.setSelectedProfileId(id);
    setSelectedId(id);
    setShowPicker(false);
  };

  const handleDeleteProfile = async (id) => {
    try {
      // (Versión simple) Solo elimina el perfil. Si querés re-asignar/borrar hábitos del perfil,
      // lo hacemos luego con un ProfileOps separado.
      await ProfileService.removeProfile(id);
      const list = await reloadProfiles();

      if (!list.length) {
        await ProfileService.setSelectedProfileId(null);
        setSelectedId(null);
        setShowOnboarding(true);
        setShowPicker(false);
        return;
      }
      const sel = await ProfileService.getSelectedProfileId();
      setSelectedId(sel);
      setShowPicker(true);
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar el perfil.');
    }
  };

  if (loading) {
    return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator/></View>;
  }

  if (showOnboarding) {
    return <Onboarding onCreated={handleCreated} onCancel={handleCancelOnboarding} />;
  }

  if (!selectedId) {
    return (
      <ProfilePickerModal
        visible={true}
        profiles={profiles}
        onSelect={handleSelect}
        onCreateNew={() => setShowOnboarding(true)}
        onDelete={handleDeleteProfile}
        onClose={() => {}}
      />
    );
  }

  return (
    <>
      <HomeScreen
        currentProfileId={selectedId}
        profiles={profiles}
        onChangeProfile={() => setShowPicker(true)}
      />
      <ProfilePickerModal
        visible={showPicker}
        profiles={profiles}
        onSelect={handleSelect}
        onCreateNew={() => { setShowPicker(false); setShowOnboarding(true); }}
        onDelete={handleDeleteProfile}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}
