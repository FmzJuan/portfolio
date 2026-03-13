import imaplib
import smtplib
import email
import time
import email.utils
import sys
import datetime
from email.message import EmailMessage
from email.utils import parsedate_to_datetime
from email.header import decode_header

# ==========================================
# CONFIGURAÇÕES DE SERVIDOR E ADMIN
# ==========================================
TITAN_IMAP_SERVER = "imap.titan.email"
TITAN_SMTP_SERVER = "smtp.titan.email"
ADMIN_EMAIL = "juan.investur@gmail.com"

EMAIL_DISPARADOR_ALERTA = "juan@investur.com.br"
SENHA_DISPARADOR_ALERTA = "Meneghesso#2025" 

# URL da logo da Investur para o relatório (Pode hospedar no Imgur ou usar link do site)
LOGO_INVESTUR = "https://investur.com.br/wp-content/imagens-juan/logo.png?_t=1771946394" # Substitua pelo link real da logo

CONTAS = [
     {"titan_email": "anapaula@investur.com.br", "titan_password": "Japao#invt26", "gmail_destino": "anapaula.investur@gmail.com"},
    {"titan_email": "juan@investur.com.br", "titan_password": "Meneghesso#2025", "gmail_destino": "juan.investur@gmail.com"},
    {"titan_email": "gleyce@investur.com.br", "titan_password": "835@Migr483", "gmail_destino": "gleyce.investur@gmail.com"},
     {"titan_email": "junior@investur.com.br", "titan_password": "Investur@123", "gmail_destino": "junior.investur@gmail.com"},
      {"titan_email": "alberto@investur.com.br", "titan_password": "Japao#2025", "gmail_destino": "alberto.investur@gmail.com"},
    # Adicione os outros funcionários aqui seguindo o mesmo padrão
]

TEMPO_POR_CICLO_SEG = 60
TOTAL_CICLOS = 15

def verificar_e_acionar_fallback(conta):
    email_origem = conta["titan_email"]
    senha = conta["titan_password"]
    email_destino = conta["gmail_destino"]
    
    resultado = {"sucessos": 0, "falhas": [], "detalhes_emails": []}

    try:
        mail = imaplib.IMAP4_SSL(TITAN_IMAP_SERVER, 993)
        mail.login(email_origem, senha)
        
        status_sel, _ = mail.select("inbox")
        if status_sel != 'OK':
            mail.logout()
            resultado["falhas"].append("Erro ao acessar a Inbox.")
            return resultado

        # 1. Busca todos, exceto os que já deram erro e ganharam estrela
        status, mensagens = mail.search(None, "UNFLAGGED")
        lista_ids = mensagens[0].split()

        if not lista_ids:
            mail.logout()
            return resultado

        smtp_server = smtplib.SMTP_SSL(TITAN_SMTP_SERVER, 465)
        smtp_server.login(email_origem, senha)

        agora_local = datetime.datetime.now()

        for num in lista_ids:
            try:
                status, dados = mail.fetch(num, "(RFC822)")
                if not dados or dados[0] is None: continue
                
                msg_original = email.message_from_bytes(dados[0][1])
                
                # --- INÍCIO DA TRADUÇÃO DO ASSUNTO (UTF-8) ---
                assunto_raw = msg_original.get('Subject', 'Sem Assunto')
                assunto_orig = ""
                
                for texto, charset in decode_header(assunto_raw):
                    if isinstance(texto, bytes):
                        assunto_orig += texto.decode(charset or 'utf-8', errors='replace')
                    else:
                        assunto_orig += str(texto)
                # --- FIM DA TRADUÇÃO ---
                
                remetente_orig = str(msg_original.get('From', 'Desconhecido'))
                nome_cliente, email_cliente = email.utils.parseaddr(remetente_orig)
                
                data_header = msg_original.get('Date')
                str_chegada = "Desconhecida"
                str_ciclo = "Desconhecido"
                
                if data_header:
                    try:
                        dt_chegada = parsedate_to_datetime(data_header).astimezone()
                        str_chegada = dt_chegada.strftime('%H:%M:%S')
                        atraso_minutos = int((agora_local.astimezone() - dt_chegada).total_seconds() / 60)
                        
                        ciclos_passados = atraso_minutos
                        if ciclos_passados < TOTAL_CICLOS and ciclos_passados >= 0:
                            ciclo_estimado = TOTAL_CICLOS - ciclos_passados
                            str_ciclo = f"{ciclo_estimado}/{TOTAL_CICLOS}"
                        else:
                            str_ciclo = "Antes do Início do Loop"
                    except:
                        pass

                assunto_limpo = assunto_orig.replace('\r', '').replace('\n', '')

                # ==========================================
                # PREPARAÇÃO 1: O E-MAIL DE AVISO (HTML + ANEXO)
                # ==========================================
                nova_msg = EmailMessage()
                nova_msg['Subject'] = f"[TI Investur] Aviso de Resgate: {assunto_limpo}"
                nova_msg['From'] = f'"Sistema de Segurança TI" <{email_origem}>'
                nova_msg['To'] = email_destino
                
                if email_cliente:
                    nova_msg['Reply-To'] = email_cliente
                
                corpo_html = f"""
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #ffffff; color: #333; margin: 0; padding: 20px;">
                    <div style="max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-bottom: 3px solid #FF6600;">
                            <tr>
                                <td width="130" style="padding: 20px; vertical-align: middle; text-align: center;">
                                    <img src="{LOGO_INVESTUR}" alt="Investur" style="max-width: 120px; display: block; margin: 0 auto;">
                                </td>
                                <td style="padding: 20px 20px 20px 0; vertical-align: middle; text-align: left;">
                                    <h2 style="color: #FF6600; margin: 0; font-size: 20px; text-transform: uppercase;">Aviso de Segurança TI</h2>
                                    <p style="color: #777; margin: 4px 0 0 0; font-size: 13px;">E-mail Resgatado (Fallback)</p>
                                </td>
                            </tr>
                        </table>
                        <div style="padding: 30px; background-color: #ffffff;">
                            <p style="font-size: 15px; margin-top: 0; color: #333;">Olá,</p>
                            <p style="font-size: 15px; line-height: 1.6; color: #555;">O nosso sistema de segurança identificou que um e-mail destinado a você sofreu um atraso no servidor principal e não foi entregue nativamente.</p>
                            <p style="font-size: 15px; line-height: 1.6; color: #555;">Para garantir que você não perca nenhuma comunicação importante, nosso robô de backup resgatou a mensagem e a entregou por aqui.</p>
                            <div style="background-color: #fafafa; padding: 18px; border-left: 4px solid #FF6600; margin: 25px 0;">
                                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 15px;">Detalhes da Mensagem Original</h4>
                                <p style="margin: 5px 0; font-size: 14px; color: #555;"><b>De:</b> {remetente_orig}</p>
                                <p style="margin: 5px 0; font-size: 14px; color: #555;"><b>Assunto:</b> {assunto_limpo}</p>
                                <p style="margin: 5px 0; font-size: 14px; color: #555;"><b>Data Original:</b> {str_chegada}</p>
                            </div>
                            <div style="border: 2px dashed #FF6600; background-color: #fff9f5; padding: 15px; border-radius: 6px; text-align: center;">
                                <p style="color: #FF6600; font-weight: bold; font-size: 15px; margin: 0; line-height: 1.4;">
                                    📌 ATENÇÃO: O e-mail original completo foi enviado a você em uma mensagem separada (logo acima desta). Você também pode encontrar o arquivo .eml anexado abaixo caso prefira.
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """
                
                nova_msg.add_alternative(corpo_html, subtype='html')
                nome_anexo = "".join(c for c in assunto_limpo[:30] if c.isalnum() or c in (' ', '_', '-')).strip()
                nova_msg.add_attachment(dados[0][1], maintype='message', subtype='rfc822', filename=f"{nome_anexo}.eml")

                # ==========================================
                # PREPARAÇÃO 2: O E-MAIL ORIGINAL ENCAMINHADO DIRETAMENTE
                # ==========================================
                # Limpamos os cabeçalhos antigos de roteamento para evitar problemas no SMTP e não mandar cópias para outras pessoas acidentalmente
                for header in ['Subject', 'From', 'To', 'Cc', 'Bcc', 'Reply-To', 'Return-Path', 'Sender']:
                    if header in msg_original:
                        del msg_original[header]
                
                # Adiciona os novos cabeçalhos
                msg_original['Subject'] = f"[TI.Investur] {assunto_limpo}"
                
                # O remetente oficial precisa ser do domínio @investur para o Titan não bloquear, 
                # mas o "Nome" que aparece pra pessoa será o nome do cliente original!
                nome_exibicao = nome_cliente if nome_cliente else email_cliente
                msg_original['From'] = f'"{nome_exibicao} (via TI)" <{email_origem}>'
                
                msg_original['To'] = email_destino
                if email_cliente:
                    msg_original['Reply-To'] = email_cliente # Faz o botão "Responder" ir para o cliente original

                # ==========================================
                # TENTATIVA DE ENVIO E TRATAMENTO DE ERROS
                # ==========================================
                try:
                    # 1º - Envia o Aviso do TI (com a instrução e o .eml)
                    smtp_server.send_message(nova_msg, from_addr=email_origem, to_addrs=[email_destino])
                    
                    # 2º - Envia a mensagem original separadamente, com os anexos reais e corpo HTML perfeito
                    smtp_server.send_message(msg_original, from_addr=email_origem, to_addrs=[email_destino])
                    
                    resultado["sucessos"] += 1
                    
                    # SE DEU CERTO: Marca para Deletar a original no Titan
                    mail.store(num, '+FLAGS', '(\\Seen \\Deleted)')
                    
                except Exception as erro_envio:
                    # SE FALHOU (Anexo Gigante): Marca com Estrela e envia aviso leve
                    mail.store(num, '+FLAGS', '(\\Seen \\Flagged)')
                    
                    nova_msg_lite = EmailMessage()
                    nova_msg_lite['Subject'] = f"[TI Investur] ARQUIVO RETIDO: {assunto_limpo}"
                    nova_msg_lite['From'] = f'"Sistema de Segurança TI" <{email_origem}>'
                    nova_msg_lite['To'] = email_destino
                    
                    corpo_lite = (
                        f"Olá,\n\nUm e-mail de {remetente_orig} tentou ser resgatado pelo nosso robô de backup.\n\n"
                        f"No entanto, os arquivos contidos na mensagem original excedem o limite de tamanho para encaminhamento automático.\n\n"
                        f"Por favor, acesse o webmail oficial do Titan para ler a mensagem e baixar os arquivos pesados.\n\n"
                        f"Equipe de Tecnologia - Investur"
                    )
                    nova_msg_lite.set_content(corpo_lite)
                    smtp_server.send_message(nova_msg_lite, from_addr=email_origem, to_addrs=[email_destino])
                    
                    resultado["falhas"].append(f"Anexo gigante isolado no servidor: {assunto_limpo}")
                
                # Guarda os dados para o relatório
                str_entrega = agora_local.strftime('%H:%M:%S')
                resultado["detalhes_emails"].append({
                    "assunto": assunto_limpo,
                    "chegada": str_chegada,
                    "entrega": str_entrega,
                    "ciclo": str_ciclo
                })

            except Exception as e_msg:
                resultado["falhas"].append(f"Erro no e-mail '{assunto_orig}': {str(e_msg)}")

        # Fora do loop, limpa a lixeira
        mail.expunge()
        smtp_server.quit()
        mail.logout()

    except Exception as e_geral:
        resultado["falhas"].append(f"Falha de Conexão: {str(e_geral)}")

    return resultado

def enviar_relatorio_admin(relatorio_geral):
    print(f"\n[SISTEMA] Disparando Relatório Executivo para {ADMIN_EMAIL}...")
    
    total_sucessos = sum(d["sucessos"] for d in relatorio_geral.values())
    total_falhas = sum(len(d["falhas"]) for d in relatorio_geral.values())
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; color: #333; margin: 0;">
        <div style="max-width: 700px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-bottom: 3px solid #FF6600;">
                <tr>
                    <td width="130" style="padding: 20px; vertical-align: middle; text-align: center;">
                        <img src="{LOGO_INVESTUR}" alt="Investur" style="max-width: 120px; display: block; margin: 0 auto;">
                    </td>
                    <td style="padding: 20px 20px 20px 0; vertical-align: middle; text-align: left;">
                        <h2 style="color: #FF6600; margin: 0; font-size: 22px; text-transform: uppercase;">Relatório Executivo TI</h2>
                        <p style="color: #777; margin: 4px 0 0 0; font-size: 14px;">Monitoramento de Fallback - Ciclo {TOTAL_CICLOS}/{TOTAL_CICLOS}</p>
                    </td>
                </tr>
            </table>
            <div style="padding: 30px; background-color: #ffffff;">
                <p style="color: #555; font-size: 15px; margin-top: 0;">Varredura concluída em: <b>{datetime.datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}</b></p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    """
    
    for email_conta, dados in relatorio_geral.items():
        if dados["sucessos"] == 0 and not dados["falhas"]:
            html += f"<p style='color: #666; margin: 5px 0; font-size: 14px;'>✅ <b>{email_conta}</b>: Limpo (Nativo funcionou).</p>"
        else:
            html += f"<div style='background-color: #fafafa; padding: 15px; border-left: 4px solid #FF6600; margin-bottom: 20px; border-radius: 0 4px 4px 0;'>"
            html += f"<h4 style='margin: 0 0 10px 0; color: #333; font-size: 15px;'>⚠️ Intervenção em: {email_conta}</h4>"
            
            for msg in dados["detalhes_emails"]:
                html += f"""
                <div style='font-size: 13px; color: #555; margin-bottom: 10px; border-bottom: 1px dashed #ddd; padding-bottom: 8px;'>
                    <b style='color: #333;'>Assunto:</b> {msg['assunto']}<br>
                    <span style='color: #dc3545;'>Chegou no Servidor:</span> {msg['chegada']} (Estimado Ciclo {msg['ciclo']})<br>
                    <span style='color: #28a745;'>Entregue pelo Script:</span> {msg['entrega']}<br>
                </div>
                """
            
            if dados["falhas"]:
                for erro in dados["falhas"]:
                    html += f"<p style='color: #dc3545; font-size: 13px; margin: 5px 0 0 0;'><b>Falha:</b> {erro}</p>"
            
            html += "</div>"

    html += """
            </div>
        </div>
    </body>
    </html>
    """

    try:
        msg = EmailMessage()
        msg['Subject'] = f"TI Investur - Relatório Fallback ({total_sucessos} Resgates)"
        msg['From'] = f'"Admin Monitor" <{EMAIL_DISPARADOR_ALERTA}>'
        msg['To'] = ADMIN_EMAIL
        msg.add_alternative(html, subtype='html')
        with smtplib.SMTP_SSL(TITAN_SMTP_SERVER, 465) as s:
            s.login(EMAIL_DISPARADOR_ALERTA, SENHA_DISPARADOR_ALERTA)
            s.send_message(msg)
    except Exception as e:
        print(f"Erro ao disparar relatório executivo: {e}")

if __name__ == "__main__":
    print(f"🚀 Iniciando Fallback (Ciclos de {TOTAL_CICLOS} min) para {len(CONTAS)} contas...")
    
    while True:
        for ciclo in range(1, TOTAL_CICLOS + 1):
            sys.stdout.write(f"\r[Passivo] Aguardando Titan. Ciclo {ciclo}/{TOTAL_CICLOS}... ")
            sys.stdout.flush()
            time.sleep(TEMPO_POR_CICLO_SEG)
            
        sys.stdout.write("\r" + " " * 60 + "\r")
        print(f"\n[!] Atingiu Ciclo {TOTAL_CICLOS}/{TOTAL_CICLOS}. Iniciando resgate ativo...")
        
        relatorio_do_ciclo = {}
        for conta in CONTAS:
            print(f"   > Verificando {conta['titan_email']}...")
            relatorio_do_ciclo[conta["titan_email"]] = verificar_e_acionar_fallback(conta)
            
        enviar_relatorio_admin(relatorio_do_ciclo)
        print("Varredura concluída. Reiniciando contagem...\n")