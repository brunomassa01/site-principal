import type { Lang } from './index';

/**
 * Textos legais (Privacidade e Termos).
 *
 * Ficam aqui, e não em `ui.ts`, porque são documentos — texto corrido com
 * marcação — e não rótulos de interface.
 *
 * IMPORTANTE: a versão em PORTUGUÊS é a que vale juridicamente. A versão em
 * inglês é tradução de cortesia e diz isso ao leitor, com link para o original.
 * `__EMAIL__` é trocado pelo e-mail do titular na hora de renderizar.
 */

type Doc = { titulo: string; atualizadoRotulo: string; atualizado: string; aviso?: string; html: string };

export const legal: Record<Lang, { privacidade: Doc; termos: Doc; metaPriv: string; metaTermos: string }> = {
  pt: {
    metaPriv: 'Como o site brunomassa.online coleta, usa e protege dados, e como funcionam as integrações com LinkedIn e Instagram.',
    metaTermos: 'Termos de uso do site brunomassa.online e das suas integrações com redes sociais.',
    privacidade: {
      titulo: 'Política de Privacidade',
      atualizadoRotulo: 'Última atualização:',
      atualizado: 'junho de 2026',
      html: `
<p>Esta política descreve como o site <strong>brunomassa.online</strong> trata dados, em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). Ao usar o site, você concorda com as práticas aqui descritas.</p>

<h2>1. Quem é o responsável</h2>
<p>O responsável pelo tratamento dos dados é Bruno Massa, titular do site brunomassa.online. Contato: <a href="mailto:__EMAIL__">__EMAIL__</a>.</p>

<h2>2. Quais dados coletamos</h2>
<p><strong>Visitantes do site:</strong> dados de navegação básicos (páginas acessadas, tipo de dispositivo, dados agregados de acesso) para entender o uso e melhorar o conteúdo.</p>
<p><strong>Área administrativa (painel):</strong> acessível apenas ao próprio titular, mediante login. Armazena o conteúdo que ele mesmo cria (textos, imagens, agenda de publicações).</p>
<p><strong>Integrações com redes sociais:</strong> com a autorização explícita do titular, o site armazena tokens de acesso (concedidos por ele via OAuth) usados unicamente para <strong>publicar, no perfil do próprio titular, conteúdo criado por ele</strong>. Não coletamos, lemos nem armazenamos dados de terceiros, de seguidores ou de outras contas.</p>

<h2>3. Como usamos os dados</h2>
<p>Os dados são usados para: operar e melhorar o site; permitir que o titular gerencie e publique o próprio conteúdo nas redes sociais autorizadas (LinkedIn, Instagram); e cumprir obrigações legais. Não usamos os dados para publicidade direcionada a terceiros e não vendemos dados a ninguém.</p>

<h2>4. Integrações de terceiros</h2>
<p>O site se integra a plataformas externas, sempre sob autorização do titular e conforme os termos de cada uma:</p>
<ul class="list-disc pl-5 space-y-1">
  <li><strong>LinkedIn:</strong> para publicar posts no perfil pessoal do titular, via API oficial do LinkedIn.</li>
  <li><strong>Instagram (Meta):</strong> para publicar conteúdo nas contas do próprio titular, via API oficial do Instagram/Meta.</li>
</ul>
<p>O uso dessas APIs se limita a publicar o conteúdo do próprio titular. Os tokens de acesso são guardados de forma segura e usados apenas para esse fim.</p>

<h2>5. Cookies</h2>
<p>Usamos cookies estritamente necessários para a sessão de login da área administrativa. Não usamos cookies de rastreamento publicitário de terceiros.</p>

<h2>6. Compartilhamento</h2>
<p>Não compartilhamos, vendemos ou alugamos dados pessoais. Dados podem ser processados por provedores de infraestrutura (hospedagem e banco de dados) estritamente para operar o site, e pelas APIs das redes sociais quando o titular publica o próprio conteúdo.</p>

<h2>7. Retenção</h2>
<p>Os dados são mantidos pelo tempo necessário às finalidades descritas ou enquanto durar a relação com o site, e podem ser excluídos a qualquer momento a pedido do titular.</p>

<h2>8. Seus direitos (LGPD)</h2>
<p>Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados, bem como revogar consentimentos. Para exercer qualquer direito, escreva para <a href="mailto:__EMAIL__">__EMAIL__</a>.</p>

<h2>9. Exclusão de dados</h2>
<p>Para solicitar a exclusão dos seus dados e a revogação de quaisquer autorizações de integração, envie um e-mail para <a href="mailto:__EMAIL__">__EMAIL__</a> com o assunto "Exclusão de dados". A solicitação é atendida em até 15 dias.</p>

<h2>10. Alterações</h2>
<p>Esta política pode ser atualizada. A data da última revisão fica sempre indicada no topo desta página.</p>

<h2>11. Contato</h2>
<p>Dúvidas sobre privacidade: <a href="mailto:__EMAIL__">__EMAIL__</a>.</p>`,
    },
    termos: {
      titulo: 'Termos de Serviço',
      atualizadoRotulo: 'Última atualização:',
      atualizado: 'junho de 2026',
      html: `
<p>Estes Termos regem o uso do site <strong>brunomassa.online</strong> e das funcionalidades de gestão e publicação de conteúdo nele oferecidas. Ao acessar ou usar o site, você concorda com estes Termos.</p>

<h2>1. O que é o serviço</h2>
<p>O brunomassa.online é o site pessoal de Bruno Massa, que inclui conteúdo público (textos, blog, páginas) e uma área administrativa privada, usada pelo próprio titular para criar, organizar e publicar conteúdo, inclusive nas suas redes sociais.</p>

<h2>2. Uso permitido</h2>
<p>O conteúdo público pode ser lido livremente. A área administrativa é de uso exclusivo do titular, protegida por login. É proibido tentar acessar áreas restritas, interferir no funcionamento do site ou usá-lo para fins ilícitos.</p>

<h2>3. Integrações com redes sociais</h2>
<p>O site integra-se a plataformas como LinkedIn e Instagram (Meta) por meio de suas APIs oficiais, exclusivamente para publicar conteúdo do próprio titular em suas próprias contas, mediante autorização concedida por ele. O uso dessas integrações segue também os termos de cada plataforma. O titular é o único responsável pelo conteúdo que publica.</p>

<h2>4. Propriedade intelectual</h2>
<p>Os textos, marca, identidade visual e demais conteúdos do site pertencem a Bruno Massa, salvo indicação em contrário. O uso não autorizado é vedado.</p>

<h2>5. Isenção de garantias</h2>
<p>O site é fornecido "como está". Empregamos esforços para mantê-lo disponível e correto, mas não garantimos funcionamento ininterrupto ou livre de erros. Serviços de terceiros (redes sociais, hospedagem) podem afetar a disponibilidade de certas funções.</p>

<h2>6. Limitação de responsabilidade</h2>
<p>Na máxima extensão permitida em lei, o titular não se responsabiliza por danos indiretos decorrentes do uso ou da indisponibilidade do site ou de integrações de terceiros.</p>

<h2>7. Alterações</h2>
<p>Estes Termos podem ser atualizados a qualquer momento; a data da última revisão fica indicada no topo. O uso continuado após mudanças implica concordância.</p>

<h2>8. Lei aplicável</h2>
<p>Estes Termos são regidos pelas leis do Brasil, eleito o foro do domicílio do titular para dirimir questões, salvo disposição legal em contrário.</p>

<h2>9. Contato</h2>
<p>Dúvidas sobre estes Termos: <a href="mailto:__EMAIL__">__EMAIL__</a>.</p>`,
    },
  },

  en: {
    metaPriv: 'How brunomassa.online collects, uses and protects data, and how the LinkedIn and Instagram integrations work.',
    metaTermos: 'Terms of use for brunomassa.online and its social media integrations.',
    privacidade: {
      titulo: 'Privacy Policy',
      atualizadoRotulo: 'Last updated:',
      atualizado: 'June 2026',
      aviso: 'Courtesy translation. The <a href="/privacidade">Portuguese version</a> is the legally binding one.',
      html: `
<p>This policy describes how <strong>brunomassa.online</strong> handles data, in compliance with the Brazilian General Data Protection Law (LGPD, Law 13.709/2018). By using the site, you agree to the practices described here.</p>

<h2>1. Who is responsible</h2>
<p>The data controller is Bruno Massa, owner of brunomassa.online. Contact: <a href="mailto:__EMAIL__">__EMAIL__</a>.</p>

<h2>2. What data we collect</h2>
<p><strong>Site visitors:</strong> basic browsing data (pages visited, device type, aggregate access data) to understand usage and improve the content.</p>
<p><strong>Admin area (painel):</strong> accessible only to the owner, behind a login. It stores the content he creates himself (texts, images, publishing schedule).</p>
<p><strong>Social media integrations:</strong> with the owner's explicit authorisation, the site stores access tokens (granted by him via OAuth) used solely to <strong>publish content he created on his own profile</strong>. We do not collect, read or store data belonging to third parties, followers or other accounts.</p>

<h2>3. How we use data</h2>
<p>Data is used to: operate and improve the site; allow the owner to manage and publish his own content on the authorised social networks (LinkedIn, Instagram); and comply with legal obligations. We do not use data for advertising targeted at third parties, and we do not sell data to anyone.</p>

<h2>4. Third-party integrations</h2>
<p>The site integrates with external platforms, always under the owner's authorisation and subject to each platform's terms:</p>
<ul class="list-disc pl-5 space-y-1">
  <li><strong>LinkedIn:</strong> to publish posts on the owner's personal profile, via the official LinkedIn API.</li>
  <li><strong>Instagram (Meta):</strong> to publish content on the owner's own accounts, via the official Instagram/Meta API.</li>
</ul>
<p>Use of these APIs is limited to publishing the owner's own content. Access tokens are stored securely and used only for that purpose.</p>

<h2>5. Cookies</h2>
<p>We use cookies strictly necessary for the admin area login session. We do not use third-party advertising or tracking cookies.</p>

<h2>6. Sharing</h2>
<p>We do not share, sell or rent personal data. Data may be processed by infrastructure providers (hosting and database) strictly to operate the site, and by the social media APIs when the owner publishes his own content.</p>

<h2>7. Retention</h2>
<p>Data is kept for as long as necessary for the purposes described, or for the duration of the relationship with the site, and may be deleted at any time at the owner's request.</p>

<h2>8. Your rights (LGPD)</h2>
<p>You may request access, correction, portability or deletion of your data, as well as withdraw consent. To exercise any right, write to <a href="mailto:__EMAIL__">__EMAIL__</a>.</p>

<h2>9. Data deletion</h2>
<p>To request deletion of your data and revocation of any integration authorisations, send an email to <a href="mailto:__EMAIL__">__EMAIL__</a> with the subject "Data deletion". Requests are handled within 15 days.</p>

<h2>10. Changes</h2>
<p>This policy may be updated. The date of the latest revision is always shown at the top of this page.</p>

<h2>11. Contact</h2>
<p>Privacy questions: <a href="mailto:__EMAIL__">__EMAIL__</a>.</p>`,
    },
    termos: {
      titulo: 'Terms of Service',
      atualizadoRotulo: 'Last updated:',
      atualizado: 'June 2026',
      aviso: 'Courtesy translation. The <a href="/termos">Portuguese version</a> is the legally binding one.',
      html: `
<p>These Terms govern the use of <strong>brunomassa.online</strong> and the content management and publishing features it offers. By accessing or using the site, you agree to these Terms.</p>

<h2>1. What the service is</h2>
<p>brunomassa.online is the personal site of Bruno Massa. It includes public content (texts, blog, pages) and a private admin area used by the owner to create, organise and publish content, including to his social networks.</p>

<h2>2. Permitted use</h2>
<p>Public content may be read freely. The admin area is for the owner's exclusive use and is protected by a login. Attempting to access restricted areas, interfering with the operation of the site, or using it for unlawful purposes is prohibited.</p>

<h2>3. Social media integrations</h2>
<p>The site integrates with platforms such as LinkedIn and Instagram (Meta) through their official APIs, exclusively to publish the owner's own content on his own accounts, under authorisation granted by him. Use of these integrations is also subject to each platform's terms. The owner is solely responsible for the content he publishes.</p>

<h2>4. Intellectual property</h2>
<p>The texts, brand, visual identity and other content on the site belong to Bruno Massa, unless stated otherwise. Unauthorised use is prohibited.</p>

<h2>5. Disclaimer of warranties</h2>
<p>The site is provided "as is". We make efforts to keep it available and accurate, but we do not guarantee uninterrupted or error-free operation. Third-party services (social networks, hosting) may affect the availability of certain features.</p>

<h2>6. Limitation of liability</h2>
<p>To the fullest extent permitted by law, the owner is not liable for indirect damages arising from the use or unavailability of the site or of third-party integrations.</p>

<h2>7. Changes</h2>
<p>These Terms may be updated at any time; the date of the latest revision is shown at the top. Continued use after changes implies agreement.</p>

<h2>8. Governing law</h2>
<p>These Terms are governed by the laws of Brazil, with the courts of the owner's domicile elected to settle disputes, unless the law provides otherwise.</p>

<h2>9. Contact</h2>
<p>Questions about these Terms: <a href="mailto:__EMAIL__">__EMAIL__</a>.</p>`,
    },
  },
};

/** Troca o placeholder do e-mail no documento. */
export function comEmail(html: string, email: string): string {
  return html.split('__EMAIL__').join(email);
}
