/**
 * UserDashboardPage.jsx
 *
 * Panel Router — Detecta el user_type del usuario y renderiza
 * el panel especializado correspondiente:
 *   - particular       → DashboardParticular
 *   - agencia          → DashboardAgencia
 *   - negocio_automotor → DashboardNegocio
 *
 * Cada panel es completamente independiente con su propia lógica,
 * pestañas y sección de planes/pricing alineada al modelo de cobros.
 */
import React from 'react';
import DashboardParticular from './dashboards/DashboardParticular';
import DashboardAgencia from './dashboards/DashboardAgencia';
import DashboardNegocio from './dashboards/DashboardNegocio';

export default function UserDashboardPage(props) {
  const userType = props.currentUser?.profile?.user_type || 'particular';

  if (userType === 'agencia') {
    return <DashboardAgencia {...props} />;
  }

  if (userType === 'negocio_automotor') {
    return <DashboardNegocio {...props} />;
  }

  // Default: particular
  return <DashboardParticular {...props} />;
}
