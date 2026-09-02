/**
 * URLs de documentos legales (PDF en brickle.app).
 */
export const BRICKLE_TERMS_AND_CONDITIONS_PDF_URL =
  "https://brickle.app/docs/BRICKLE_SAS_Terminos_y_condiciones_20102025.pdf";

export const BRICKLE_PRIVACY_POLICY_PDF_URL =
  "https://brickle.app/docs/BRICKLE_SAS_Politica_de_privacidad_20102025.pdf";

/** Página HTML de políticas (fallback o enlaces web). */
export const BRICKLE_PRIVACY_POLICY_WEB_URL =
  "https://brickle.app/politicas-de-privacidad";

// TODO: reemplazar por la URL pública definitiva una vez el documento
// "BRICKLE - Contrato colaboración empresarial" sea aprobado y publicado en brickle.app.
export const BRICKLE_BUSINESS_COLLABORATION_CONTRACT_PDF_URL =
  "https://brickle.app/docs/BRICKLE_SAS_Contrato_colaboracion_empresarial.pdf";

// TODO: reemplazar por la URL pública definitiva una vez el documento
// "Declaracion_Origen_Fondos_App_Brickle" sea aprobado y publicado en brickle.app.
export const BRICKLE_ORIGIN_OF_FUNDS_DECLARATION_PDF_URL =
  "https://brickle.app/docs/BRICKLE_SAS_Declaracion_origen_de_fondos.pdf";

export interface LegalDocumentDefinition {
  id: string;
  title: string;
  /** URL del PDF o página a mostrar en el WebView */
  url: string;
  /**
   * Contenido local del documento (texto plano) para los documentos que aún
   * no están publicados en brickle.app. Cuando está presente, la app renderiza
   * este texto directamente en la pantalla de firma en lugar de abrir el `url`.
   */
  content?: string;
  /** Si es true, el usuario debe firmar en pantalla para poder aceptarlo. */
  requiresSignature?: boolean;
}

export const BUSINESS_COLLABORATION_CONTRACT_CONTENT = `CONTRATO DE COLABORACIÓN EMPRESARIAL
ENTRE EL USUARIO Y BRICKLE S.A.S.

• EL USUARIO quien para todos los efectos de este CONTRATO se denominará "EL USUARIO"; y,

• SANTIAGO GARCÍA RUÍZ, mayor de edad, identificado como aparece al pie de mi firma, domiciliado en Bogotá D.C., quien en su condición de Representante Legal obra en nombre y representación de la sociedad BRICKLE S.A.S., identificada con NIT 901.952.910 y que para todos los efectos del presente CONTRATO se denominará "BRICKLE".

EL USUARIO y BRICKLE, quienes para todos los efectos de este CONTRATO se denominarán conjuntamente las "PARTES", han acordado celebrar el presente contrato de colaboración empresarial (en adelante el "CONTRATO"), que se regirá por las cláusulas indicadas a continuación, previas las siguientes:

• BRICKLE será la representante líder y gestora del CONTRATO.
• El CONTRATO regula una relación legal y comercial marco de BRICKLE con cada uno de los USUARIOS.

En virtud de lo anterior, BRICKLE con cada usuario y por cada proyecto, expedirá un anexo técnico y financiero, el cual será parte integrante del CONTRATO.

CLÁUSULAS

PRIMERA. - OBJETO: Este CONTRATO tiene como objeto la unión de esfuerzos y el trabajo conjunto de las PARTES para la gestión y suscripción de contratos de arrendamiento de bienes muebles (en adelante el "PROYECTO").

SEGUNDA. - OBLIGACIONES DEL USUARIO: El USUARIO tendrá a su cargo las siguientes obligaciones, sin perjuicio de aquellas que se desprendan de la naturaleza del CONTRATO:
• Poner a disposición de BRICKLE su experiencia y conocimiento profesional y/o comercial para el adecuado, correcto y oportuno cumplimiento del objeto del CONTRATO.
• Participar exclusivamente en el negocio objeto del presente CONTRATO mediante la aplicación de BRICKLE disponible en App Store y Google Play.
• Cumplir con los términos y condiciones de BRICKLE, y los demás documentos legales y corporativos publicados por BRICKLE en su página web www.brickle.app
• Mantener y salvaguardar la imagen y la relación comercial de BRICKLE.
• Desarrollar todas las operaciones del negocio con lealtad, diligencia y profesionalismo.
• Informar a BRICKLE acerca de cualquier evento que pudiere afectar el normal desarrollo de este CONTRATO.

TERCERA. - OBLIGACIONES DE BRICKLE: BRICKLE tendrá a su cargo las siguientes obligaciones, sin perjuicio de aquellas que se desprendan de la naturaleza del CONTRATO:
• Poner a disposición del USUARIO su experiencia y conocimiento profesional y/o comercial para el adecuado, correcto y oportuno cumplimiento del objeto del CONTRATO.
• Cumplir con los términos y condiciones de BRICKLE, y los demás documentos legales y corporativos publicados por BRICKLE en su página web www.brickle.app
• Expedir el anexo técnico y financiero por cada proyecto.
• Expedir los soportes contables y tributarios indicados en la Cláusula Cuarta del CONTRATO.
• Desarrollar todas las operaciones del negocio con lealtad, diligencia y profesionalismo.
• Mantener y salvaguardar la imagen y la relación comercial del USUARIO.
• Informar al USUARIO acerca de cualquier evento que pudiere afectar el normal desarrollo de este CONTRATO.

CUARTA. – UTILIDADES, HONORARIOS, COMISIONES, COSTOS, GASTOS Y FORMA DE PAGO DEL CONTRATO: Las utilidades, los honorarios, comisiones, costos, gastos y forma de pago del CONTRATO, serán pactados de común acuerdo por las PARTES, en forma independiente y separada por cada cliente y por cada trabajo a realizar a favor de este, los cuales serán estipulados en un anexo que será parte integrante del CONTRATO.

Para los soportes tributarios y contables respectivos, se expedirá la certificación de que trata el artículo 18 del Estatuto Tributario.

QUINTA. - RELACIÓN ENTRE LAS PARTES Y SUS EMPLEADOS Y CONTRATISTAS: Entre el USUARIO y BRICKLE no existe ninguna relación de subordinación o dependencia. Entre el USUARIO, BRICKLE y los empleados de cada una de las PARTES no existirá vínculo laboral o civil alguno. En consecuencia, las PARTES asumen de manera individual y autónoma toda la responsabilidad que le pueda corresponder como único empleador de sus empleados actuales y/o de las personas que contrate para desarrollar la actividad objeto de este CONTRATO, siendo de su cargo los salarios, prestaciones sociales, indemnizaciones, honorarios y demás obligaciones a que hubiere lugar, y viceversa.

SEXTA. - CONFIDENCIALIDAD: Las PARTES aceptan y reconocen que toda la información legal, contable, tributaria, financiera, técnica, tecnológica, empresarial, las marcas, patentes, inventos, invenciones intelectuales y en general cualquier tipo de secreto industrial que surja o se maneja en virtud del CONTRATO, tendrá el carácter de información reservada o confidencial frente a terceros.

EXCEPCIONES A LA OBLIGACIÓN DE CONFIDENCIALIDAD – La obligación de no revelar la información confidencial y las restricciones para su utilización no existirá o cesará cuando: 1) Las partes la conozcan lícitamente antes de que le sea revelada por la parte contraria; (2) Las partes la reciban lícitamente de un tercero que tenga derecho de proporcionarla; (3) La información se haya convertido lícitamente en información de dominio público; (4) La información sea divulgada por una de las partes para cumplir con un requerimiento legal de una autoridad competente. En tal caso, deberá informar de ello a la parte contraria, dentro de los tres (3) días siguientes al recibo de la solicitud por parte de la autoridad competente; 5) Las partes convengan, por escrito, que la información queda libre de tales restricciones.

SÉPTIMA. - CESIÓN DEL CONTRATO: El presente CONTRATO y los derechos y obligaciones que de él emanen, no podrán cederse total ni parcialmente por ninguna de las PARTES, sin el consentimiento previo, expreso y por escrito de la otra.

OCTAVA. - ALCANCE DEL CONTRATO: El presente CONTRATO constituye el único y entero acuerdo entre las PARTES en relación con el objeto contratado, y prevalece sobre cualquier propuesta verbal o escrita, sobre toda negociación previa y sobre todas las demás comunicaciones entre las PARTES con respecto al objeto del CONTRATO.

NOVENA. - LEY APLICABLE: Este CONTRATO se regirá, se interpretará y será ejecutado con sujeción a las cláusulas aquí contenidas, y de acuerdo con las leyes de la República de Colombia.

DÉCIMA. - DIVISIBILIDAD DEL CONTRATO: Cualquier pacto o disposición de este CONTRATO que se anule o se considere nulo o inexigible en su totalidad o en parte, no afectará o perjudicará la validez o exigibilidad de cualquier otro pacto o disposición aquí establecido, a menos que aparezca que en todo el negocio aquí regulado no se habría celebrado sin la disposición o pacto viciado de nulidad.

DÉCIMO PRIMERA. - PROTECCIÓN DE DATOS PERSONALES. Las PARTES acuerdan que cualquier dato de terceros deberán ser recolectados de acuerdo con la reglamentación vigente y cuenta con las autorizaciones de sus titulares. Las PARTES acuerdan que la información dada no será modificada, alterada o divulgada, salvo para la finalidad establecida en este CONTRATO y está siendo almacenada de acuerdo con las Políticas de Protección de Datos Personales y de Seguridad de la Información de BRICKLE.`;

export const ORIGIN_OF_FUNDS_DECLARATION_CONTENT = `BRICKLE S.A.S.
Vinculación como cuentapartícipe

DECLARACIÓN DE ORIGEN DE FONDOS Y LICITUD DE RECURSOS

Al marcar la casilla de aceptación y continuar con mi registro en la plataforma de BRICKLE S.A.S., yo, identificado con los datos suministrados durante mi registro, declaro de manera libre, voluntaria, expresa e informada, y bajo la gravedad de juramento, lo siguiente:

1. Que los recursos que aporto y aportaré a través de la plataforma provienen de actividades lícitas y no están relacionados, directa ni indirectamente, con el lavado de activos, la financiación del terrorismo, ni con ninguna otra actividad ilícita.

2. Que la información y los documentos que suministré durante mi registro son veraces, completos y verificables, y me comprometo a mantenerlos actualizados y a informar cualquier cambio cuando este se produzca o cuando BRICKLE S.A.S. lo requiera.

3. Que ni yo, ni las personas que represento, ni mis beneficiarios finales, nos encontramos incluidos en listas restrictivas nacionales o internacionales de control (entre ellas las de la ONU y la OFAC) vinculantes para Colombia.

4. Que la información que suministré sobre mi condición de Persona Expuesta Políticamente (PEP), o mi vínculo con una, es veraz y la actualizaré si dicha condición cambia.

5. Que los retiros y el pago de rendimientos que solicite se realizarán únicamente a una cuenta bancaria de mi propia titularidad, y autorizo a BRICKLE S.A.S. a rechazar cualquier solicitud de desembolso a cuentas de terceros.

6. Que autorizo a BRICKLE S.A.S. para consultar, verificar, validar y reportar la información aquí declarada ante las autoridades competentes, centrales de riesgo y listas de control, y para realizar las validaciones de origen de fondos que estime necesarias, sin que ello genere responsabilidad alguna a su cargo.

7. Que autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 y a la Política de Tratamiento de Datos de BRICKLE S.A.S., con las finalidades de vinculación, cumplimiento normativo y gestión de mi inversión.

8. Que exonero a BRICKLE S.A.S. de toda responsabilidad derivada de la inexactitud o falsedad de la información aquí declarada, y reconozco que ello podrá dar lugar a la terminación de mi vinculación y a los reportes que exija la ley.

Manifestación de voluntad. Reconozco que marcar la casilla de aceptación constituye mi manifestación de voluntad y equivale a mi firma electrónica en los términos de la Ley 527 de 1999, con plenos efectos legales. Declaro haber leído y comprendido esta declaración de forma previa a mi aceptación.`;

export const LEGAL_DOCUMENTS: LegalDocumentDefinition[] = [
  {
    id: "terms",
    title: "Términos y condiciones",
    url: BRICKLE_TERMS_AND_CONDITIONS_PDF_URL,
  },
  {
    id: "privacy",
    title: "Política de tratamiento de datos",
    url: BRICKLE_PRIVACY_POLICY_PDF_URL,
  },
  {
    id: "business-collaboration-contract",
    title: "Contrato de colaboración empresarial",
    url: BRICKLE_BUSINESS_COLLABORATION_CONTRACT_PDF_URL,
    content: BUSINESS_COLLABORATION_CONTRACT_CONTENT,
    requiresSignature: true,
  },
  {
    id: "origin-of-funds-declaration",
    title: "Declaración de origen de fondos",
    url: BRICKLE_ORIGIN_OF_FUNDS_DECLARATION_PDF_URL,
    content: ORIGIN_OF_FUNDS_DECLARATION_CONTENT,
    requiresSignature: true,
  },
];

/** Documentos que el usuario debe aceptar explícitamente al completar su perfil. */
export const PROFILE_CONSENT_DOCUMENTS: LegalDocumentDefinition[] = [
  {
    id: "terms",
    title: "Términos y condiciones",
    url: BRICKLE_TERMS_AND_CONDITIONS_PDF_URL,
  },
  {
    id: "business-collaboration-contract",
    title: "Contrato de colaboración empresarial",
    url: BRICKLE_BUSINESS_COLLABORATION_CONTRACT_PDF_URL,
    content: BUSINESS_COLLABORATION_CONTRACT_CONTENT,
    requiresSignature: true,
  },
  {
    id: "origin-of-funds-declaration",
    title: "Declaración de origen de fondos",
    url: BRICKLE_ORIGIN_OF_FUNDS_DECLARATION_PDF_URL,
    content: ORIGIN_OF_FUNDS_DECLARATION_CONTENT,
    requiresSignature: true,
  },
];
