

export type EmailStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'INFO';

interface RenderEmailTemplateParams {
  /** Texto exibido na prévia do e-mail */
  preheader: string;

  /** Título principal */
  title: string;

  /** Badge acima do título */
  badge?: EmailStatus;

  /** Conteúdo principal */
  contentHtml: string;

  /** Texto do botão */
  ctaLabel?: string;

  /** URL do botão */
  ctaUrl?: string;

  /** Conteúdo secundário (caixa destacada) */
  secondaryContentHtml?: string;

  /** Mensagem de aviso */
  warningHtml?: string;

  /** Texto do rodapé */
  footerMessage?: string;
}

const COLORS = {
  greenDark: '#96b3a3',
  greenLight: '#40B86C',
  yellow: '#FEC92F',
  orange: '#EC8D20',
  text: '#2A2A2A',
  muted: '#6B6B6B',
  bg: '#F3F5F4',
  cardBg: '#FFFFFF',
  border: '#E5E9E6',
};

const BADGE_STYLES: Record<
  EmailStatus,
  {
    bg: string;
    color: string;
    label: string;
  }
> = {
  PENDENTE: {
    bg: COLORS.yellow,
    color: '#5B4300',
    label: 'EM ANÁLISE',
  },
  APROVADO: {
    bg: COLORS.greenLight,
    color: '#FFFFFF',
    label: 'APROVADO',
  },
  REJEITADO: {
    bg: COLORS.orange,
    color: '#FFFFFF',
    label: 'REJEITADO',
  },
  INFO: {
    bg: '#EDF2F7',
    color: '#4A5568',
    label: 'INFORMAÇÃO',
  },
};

/**
 * Logo enviada como anexo inline (cid:logo)
 */
const LOGO_SRC = 'cid:logo';

export function renderEmailTemplate({
  preheader,
  title,
  badge,
  contentHtml,
  ctaLabel,
  ctaUrl,
  secondaryContentHtml,
  warningHtml,
  footerMessage,
}: RenderEmailTemplateParams): string {
  const badgeStyle = badge ? BADGE_STYLES[badge] : undefined;

  return `
<!DOCTYPE html>
<html lang="pt-BR">

<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:${COLORS.bg};
    font-family:Arial,Helvetica,sans-serif;
">

<!-- Preheader -->
<div style="
display:none;
max-height:0;
overflow:hidden;
opacity:0;
">
${preheader}
</div>

<table
role="presentation"
width="100%"
cellpadding="0"
cellspacing="0"
style="
background:${COLORS.bg};
padding:40px 16px;
">

<tr>

<td align="center">

<table
role="presentation"
width="100%"
cellpadding="0"
cellspacing="0"
style="
max-width:600px;
background:${COLORS.cardBg};
border-radius:16px;
overflow:hidden;
border:1px solid ${COLORS.border};
">

<!-- HEADER -->

<tr>

<td
align="center"
style="
background:${COLORS.greenDark};
padding:40px 24px;
">

<img
src="${LOGO_SRC}"
alt="Cooperativa"
width="80"
style="
display:block;
height:auto;
">

</td>

</tr>

<!-- Barra colorida -->

<tr>

<td
style="
height:6px;
background:
linear-gradient(
90deg,
${COLORS.greenLight},
${COLORS.yellow},
${COLORS.orange}
);
">

</td>

</tr>

<!-- Conteúdo -->

<tr>

<td style="padding:40px;">

${
badgeStyle
? `
<span
style="
display:inline-block;
padding:6px 16px;
background:${badgeStyle.bg};
color:${badgeStyle.color};
font-size:12px;
font-weight:bold;
border-radius:20px;
letter-spacing:.4px;
margin-bottom:24px;
">
${badgeStyle.label}
</span>
`
: ''
}

<h1
style="
margin:24px 0 24px;
font-size:30px;
color:${COLORS.text};
line-height:1.3;
font-weight:bold;
">
${title}
</h1>

<div
style="
font-size:16px;
line-height:1.8;
color:${COLORS.text};
">
${contentHtml}
</div>

${
warningHtml
? `
<div
style="
margin-top:28px;
padding:18px;
border-left:4px solid ${COLORS.orange};
background:#FFF8F2;
color:${COLORS.text};
font-size:15px;
line-height:1.6;
">
${warningHtml}
</div>
`
: ''
}

${
ctaLabel && ctaUrl
? `
<table
role="presentation"
cellpadding="0"
cellspacing="0"
style="
margin:36px auto;
">

<tr>

<td
align="center"
style="
background:${COLORS.greenDark};
border-radius:8px;
">

<a
href="${ctaUrl}"
target="_blank"
style="
display:inline-block;
padding:15px 34px;
color:#FFFFFF;
font-size:16px;
font-weight:bold;
text-decoration:none;
">
${ctaLabel}
</a>

</td>

</tr>

</table>
`
: ''
}

${
secondaryContentHtml
? `
<div
style="
margin-top:32px;
padding:22px;
background:#F8FAF9;
border:1px solid ${COLORS.border};
border-radius:10px;
font-size:15px;
line-height:1.7;
color:${COLORS.text};
">
${secondaryContentHtml}
</div>
`
: ''
}

</td>

</tr>

<!-- Rodapé -->

<tr>

<td
style="
padding:32px;
border-top:1px solid ${COLORS.border};
text-align:center;
">

<p
style="
margin:0;
font-size:13px;
line-height:1.7;
color:${COLORS.muted};
">

${
footerMessage ??
`Este é um e-mail automático, não é necessário responder.<br>
Cooperativa • Todos os direitos reservados.`
}

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
}