# Scenarios — Acceptance Specs (BDD)

> Escenarios de aceptación en formato Gherkin.
> Generados durante la fase `discuss`.

```gherkin
Feature: Customer Onboarding

  Scenario: Happy path - nuevo Customer se registra y obtiene LoyaltyCard
    Given un Customer escanea el NFC tag o QR estático de la mesa
    And el dispositivo abre la URL de registro
    When el Customer introduce nombre, email y acepta marketing_consent
    And el email no existe en la base de datos
    Then se crea un Customer con UUID generado
    And se crea una LoyaltyCard vinculada con stamps_current = 0
    And se asigna active_reward_id con el Reward activo actual
    And se muestra la tarjeta web con nombre de pila y 0 sellos

  Scenario: Email ya registrado - error genérico sin revelar datos
    Given un visitante accede a la URL de registro
    When introduce un email que ya existe en la tabla customers
    Then se muestra un mensaje genérico "Este email ya está registrado"
    And no se revela el nombre ni datos del Customer existente

  Scenario: Datos inválidos - campos vacíos o email malformado
    Given un visitante accede a la URL de registro
    When envía el formulario con nombre vacío
    Then se muestra un error de validación "El nombre es obligatorio"
    When envía el formulario con email malformado
    Then se muestra un error de validación "Introduce un email válido"
    When envía el formulario sin aceptar marketing_consent
    Then se permite el registro pero marketing_consent queda en false


Feature: Stamp Addition

  Scenario: Happy path - Staff añade Stamp a Customer
    Given un Staff autenticado con is_active = true
    And un Customer con LoyaltyCard activa con 3 stamps
    And el último Stamp fue hace más de 1 hora
    When el Staff escanea el QR del Customer (UUID de la LoyaltyCard)
    Then se valida que el UUID existe y la LoyaltyCard está activa
    And se muestra el nombre de pila del Customer y stamps actuales en el panel del Staff
    And el Staff confirma la operación
    And se crea un Stamp con added_by = Staff.id
    And stamps_current se incrementa a 4
    And se envía email "Nuevo sello" al Customer

  Scenario: Cooldown activo - segundo Stamp en menos de 1 hora
    Given un Customer con LoyaltyCard activa
    And el último Stamp fue hace 30 minutos
    When un Staff intenta añadir un Stamp
    Then se rechaza la operación con mensaje "Debe esperar X minutos para añadir otro sello"
    And no se crea ningún Stamp

  Scenario: Staff desactivado intenta añadir Stamp
    Given un Staff con is_active = false que aún tiene sesión abierta
    When intenta escanear el QR de un Customer
    Then se rechaza la operación con mensaje "Tu cuenta ha sido desactivada"
    And se cierra la sesión del Staff

  Scenario: LoyaltyCard desactivada - Staff intenta añadir Stamp
    Given un Customer con LoyaltyCard con is_active = false
    When un Staff escanea su QR
    Then se muestra mensaje "Esta tarjeta está desactivada"
    And no se crea ningún Stamp

  Scenario: QR con UUID inexistente
    Given un QR que contiene un UUID que no existe en la tabla loyalty_cards
    When un Staff lo escanea
    Then se muestra mensaje "Tarjeta no encontrada"
    And no se crea ningún Stamp

  Scenario: Fallo de red al añadir Stamp
    Given un Staff escanea un QR válido
    When la conexión a la base de datos falla
    Then se muestra mensaje "No se pudo añadir el sello, inténtalo de nuevo"
    And no se crea ningún Stamp ni se modifica stamps_current


Feature: Reward Cycle

  Scenario: Happy path - Customer alcanza umbral y desbloquea Reward
    Given un Customer con LoyaltyCard con stamps_current = 9
    And el Reward activo requiere 10 stamps
    When un Staff añade un Stamp
    Then stamps_current se incrementa a 10
    And el estado del ciclo cambia a reward_available
    And la tarjeta web muestra el Reward disponible
    And se envía email "Tu reward está listo"

  Scenario: Customer sigue acumulando stamps con Reward pendiente
    Given un Customer con LoyaltyCard con stamps_current = 10
    And el Reward activo requiere 10 stamps (reward_available)
    And el cooldown ha pasado
    When un Staff añade un Stamp
    Then stamps_current se incrementa a 11
    And el Reward sigue disponible para canjear
    And se envía email "Nuevo sello"

  Scenario: Staff canjea Reward del Customer
    Given un Customer con stamps_current = 12 y Reward disponible
    And el Reward activo requiere 10 stamps
    When el Staff marca el Reward como canjeado
    Then se crea una Redemption con cycle_number correspondiente
    And stamps_current se reduce a 2 (12 - 10)
    And cycles_completed se incrementa en 1
    And active_reward_id se actualiza al Reward activo actual
    And el estado del ciclo vuelve a accumulating

  Scenario: Admin cambia Reward mientras hay clientes en ciclo activo
    Given 5 Customers con ciclos activos bajo Reward "Shisha gratis (10 sellos)"
    When el Admin desactiva ese Reward y activa "Copa gratis (5 sellos)"
    Then los 5 Customers mantienen active_reward_id apuntando a "Shisha gratis"
    And completan su ciclo bajo las reglas de "Shisha gratis (10 sellos)"
    And los nuevos ciclos (tras canje) usan "Copa gratis (5 sellos)"

  Scenario: Concurrencia - dos Staff intentan añadir Stamp al mismo Customer simultáneamente
    Given un Customer con LoyaltyCard con stamps_current = 5
    And el último Stamp fue hace más de 1 hora
    When Staff_A y Staff_B escanean el QR del Customer al mismo tiempo
    Then solo uno de los dos Stamps se registra exitosamente
    And el otro recibe mensaje de cooldown
    And stamps_current se incrementa en exactamente 1


Feature: Card Management

  Scenario: Admin desactiva LoyaltyCard de un Customer
    Given un Customer con LoyaltyCard activa y stamps_current = 7
    When el Admin desactiva la LoyaltyCard
    Then is_active cambia a false
    And stamps_current se reinicia a 0
    And la tarjeta web muestra "Tarjeta desactivada"

  Scenario: Admin reactiva LoyaltyCard
    Given un Customer con LoyaltyCard desactivada
    When el Admin reactiva la LoyaltyCard
    Then is_active cambia a true
    And stamps_current permanece en 0
    And se asigna active_reward_id con el Reward activo actual
    And el Customer puede volver a acumular stamps


Feature: Security

  Scenario: Cliente malicioso intenta acceder a datos de otro Customer
    Given Customer_A tiene LoyaltyCard con UUID-A
    And Customer_B tiene LoyaltyCard con UUID-B
    When alguien accede a la vista pública con UUID-B
    Then solo ve nombre de pila + número de stamps + estado de reward
    And no se muestra email ni datos personales completos

  Scenario: Request malicioso a endpoint de cliente con service_role bypass
    Given un endpoint de cliente usa anon key + RLS
    When un atacante intenta acceder a datos de otro Customer vía API
    Then RLS bloquea el acceso
    And se devuelve error 403

  Scenario: Staff intenta acceder a rutas de Admin
    Given un Staff autenticado con role = "staff"
    When intenta acceder a /api/admin/rewards
    Then se devuelve error 403 "No tienes permisos de administrador"
```
