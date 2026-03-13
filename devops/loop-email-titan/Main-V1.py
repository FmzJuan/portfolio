import imaplib
import smtplib
import email
import time
import email.utils
import sys
import datetime
import os
from email.message import EmailMessage
from email.utils import parsedate_to_datetime
from email.header import decode_header
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env para a memória
load_dotenv()

# ==========================================
# CONFIGURAÇÕES DE SERVIDOR E ADMIN
# ==========================================
TITAN_IMAP_SERVER = os.getenv("TITAN_IMAP_SERVER")
TITAN_SMTP_SERVER = os.getenv("TITAN_SMTP_SERVER")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL") # Seu e-mail (juan.investur@gmail.com)

EMAIL_DISPARADOR_ALERTA = os.getenv("EMAIL_DISPARADOR_ALERTA")
SENHA_DISPARADOR_ALERTA = os.getenv("SENHA_DISPARADOR_ALERTA") 

# Variáveis do Fallback do Google (TI)
GMAIL_TI = os.getenv("Gmail_ti")
SENHA_APP = os.getenv("Senha_app")

LOGO_INVESTUR = "https://investur.com.br/wp-content/imagens-juan/logo.png?_t=1771946394"

CONTAS = [
    {"titan_email": os.getenv("titanEmail_ana"), "titan_password": os.getenv("titanSenha_ana"), "gmail_destino": os.getenv("gmail_ana")},
    {"titan_email": os.getenv("titanEmail_juan"), "titan_password": os.getenv("titanSenha_juan"), "gmail_destino": os.getenv("gmail_juan")},
    {"titan_email": os.getenv("titanEmail_gleyce"), "titan_password": os.getenv("titanSenha_gleyce"), "gmail_destino": os.getenv("gmail_gleyce")},
    {"titan_email": os.getenv("titanEmail_junior"), "titan_password": os.getenv("titanSenha_junior"), "gmail_destino": os.getenv("gmail_junior")},
    {"titan_email": os.getenv("titanEmail_alberto"), "titan_password": os.getenv("titanSenha_alberto"), "gmail_destino": os.getenv("gmail_alberto")},
    {"titan_email": os.getenv("titanEmail_silvia"), "titan_password": os.getenv("titanSenha_silvia"), "gmail_destino": os.getenv("gmail_silvia")},
    {"titan_email": os.getenv("titanEmail_marcel"), "titan_password": os.getenv("titanSenha_marcel"), "gmail_destino": os.getenv("gmail_marcel")},
]

TEMPO_POR_CICLO_SEG = 60
TOTAL_CICLOS = 15

# ==========================================
# ARMAZENAMENTO GLOBAL (HORA E TURNO)
# ==========================================
RELATORIO_TURNO = {conta["titan_email"]: {"detalhes_emails": []} for conta in CONTAS}
RELATORIO_HORA = {conta["titan_email"]: {"sucessos": 0, "falhas": [], "detalhes_emails": []} for conta in CONTAS}

def verificar_e_acionar_fallback(conta, dados_turno, dados_hora):
    email_origem = conta["titan_email"]
    senha = conta["titan_password"]
    
    # O destino real do funcionário, para onde o script entregará de fato
    email_destino = conta["gmail_destino"] 

    try:
        # CONEXÃO IMAP (Leitura)
        mail = imaplib.IMAP4_SSL(TITAN_IMAP_SERVER, 993)
        mail.login(email_origem, senha)
        
        status_sel, _ = mail.select("inbox")
        if status_sel != 'OK':
            mail.logout()
            dados_hora["falhas"].append("Erro ao acessar a Inbox.")
            return

        # Busca apenas Não Lidos (UNSEEN) e Sem Estrela (UNFLAGGED)
        # Isso impede que o Plano D seja processado infinitamente
        status, mensagens = mail.search(None, "(UNSEEN UNFLAGGED)")
        lista_ids = mensagens[0].split()

        if not lista_ids:
            mail.logout()
            return

        agora_local = datetime.datetime.now()

        for num in lista_ids:
            try:
                status, dados = mail.fetch(num, "(RFC822)")
                if not dados or dados[0] is None: continue
                
                raw_email_bytes = dados[0][1]
                msg_original = email.message_from_bytes(raw_email_bytes)
                
                # --- TRADUÇÃO DO ASSUNTO ---
                assunto_raw = msg_original.get('Subject', 'Sem Assunto')
                assunto_orig = ""
                for texto, charset in decode_header(assunto_raw):
                    if isinstance(texto, bytes):
                        assunto_orig += texto.decode(charset or 'utf-8', errors='replace')
                    else:
                        assunto_orig += str(texto)
                
                remetente_orig = str(msg_original.get('From', 'Desconhecido'))
                nome_cliente, email_cliente = email.utils.parseaddr(remetente_orig)
                
                original_cc = msg_original.get('Cc')
                original_reply_to = msg_original.get('Reply-To')
                
                data_header = msg_original.get('Date')
                str_chegada = "Desconhecida"
                str_ciclo = "Desconhecido"
                
                if data_header:
                    try:
                        dt_chegada = parsedate_to_datetime(data_header).astimezone()
                        str_chegada = dt_chegada.strftime('%H:%M:%S')
                        atraso_minutos = int((agora_local.astimezone() - dt_chegada).total_seconds() / 60)
                        
                        # ==========================================
                        # PLANO A: ESPERAR FORWARDING NATIVO DO TITAN
                        # ==========================================
                        if 0 <= atraso_minutos < TOTAL_CICLOS:
                            # Não marca como lido, não altera nada, apenas ignora neste ciclo
                            continue 
                            
                        str_ciclo = f"Atraso: {atraso_minutos} min"
                    except: pass

                assunto_limpo = assunto_orig.replace('\r', '').replace('\n', '')

                # ==========================================
                # PREPARAÇÃO DA MENSAGEM BASE
                # ==========================================
                msg_direta = email.message_from_bytes(raw_email_bytes)

                # Limpeza de cabeçalhos conflitantes (Executado apenas uma vez)
                for header in ['Subject', 'From', 'To', 'Cc', 'Bcc', 'Reply-To', 'Return-Path', 'Sender', 'Message-ID']:
                    if header in msg_direta:
                        del msg_direta[header]

                nome_exibicao = nome_cliente if nome_cliente else email_cliente 
                
                msg_direta['Subject'] = assunto_limpo 
                msg_direta['To'] = email_destino  
                if original_cc: msg_direta['Cc'] = original_cc
                
                # Reply-To blindado para o cliente
                if original_reply_to: msg_direta['Reply-To'] = original_reply_to
                elif email_cliente: msg_direta['Reply-To'] = email_cliente 

                metodo_usado = ""
                
                # ==========================================
                # PLANO B: TENTATIVA VIA SMTP TITAN
                # ==========================================
                # No Titan, enviamos em nome do usuário dono da conta
                msg_direta['From'] = f'"{nome_exibicao} (Resgate TI)" <{email_origem}>'
                
                try:
                    with smtplib.SMTP_SSL(TITAN_SMTP_SERVER, 465) as smtp_server:
                        smtp_server.login(email_origem, senha)
                        smtp_server.send_message(msg_direta, from_addr=email_origem, to_addrs=[email_destino])
                        
                    dados_hora["sucessos"] += 1
                    mail.store(num, '+FLAGS', '\\Deleted') # Exclui para não reprocessar
                    metodo_usado = "Plano B (Titan Nativo)"
                    
                except Exception as erro_smtp:
                    # ==========================================
                    # PLANO C: RESGATE VIA GMAIL TI (ANTI-SPAM)
                    # ==========================================
                    # O Google bloqueia (550 5.7.1) se o "From" não for idêntico à conta autenticada.
                    del msg_direta['From']
                    del msg_direta['Subject']
                    
                    # Forçamos o e-mail real do script e colocamos o remetente no assunto
                    msg_direta['From'] = f'"Resgate TI" <{GMAIL_TI}>'
                    msg_direta['Subject'] = f"De: {nome_exibicao} | {assunto_limpo}"

                    try:
                        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_gmail:
                            smtp_gmail.login(GMAIL_TI, SENHA_APP)
                            smtp_gmail.send_message(msg_direta, from_addr=GMAIL_TI, to_addrs=[email_destino])
                            
                        dados_hora["sucessos"] += 1
                        mail.store(num, '+FLAGS', '\\Deleted')
                        metodo_usado = "Plano C (Resgate Gmail)"
                        
                        # Delay de segurança para o Gmail não identificar como disparo em massa
                        time.sleep(5)
                        
                    except Exception as erro_gmail:
                        # ==========================================
                        # PLANO D: ERRO CRÔNICO
                        # ==========================================
                        dados_hora["falhas"].append(f"Erro Crônico [{assunto_limpo}]: {erro_gmail}")
                        # Marca como LIDO (\Seen) e com ESTRELA (\Flagged)
                        mail.store(num, '+FLAGS', '(\\Seen \\Flagged)')
                        metodo_usado = "Plano D (Falha Crônica)"

                # Salva os dados para o SEU relatório
                str_entrega = agora_local.strftime('%H:%M:%S')
                info_email = {
                    "assunto": assunto_limpo, 
                    "remetente": remetente_orig,
                    "chegada": str_chegada, 
                    "entrega": str_entrega, 
                    "ciclo": str_ciclo,
                    "metodo": metodo_usado
                }
                dados_hora["detalhes_emails"].append(info_email)
                dados_turno["detalhes_emails"].append(info_email)

            except Exception as e_msg:
                dados_hora["falhas"].append(f"Erro no parseamento '{assunto_orig}': {str(e_msg)}")

        mail.expunge() # Efetiva a deleção dos marcados com \Deleted (Planos B e C)
        mail.logout()

    except Exception as e_geral:
        dados_hora["falhas"].append(f"Falha de Conexão IMAP Global: {str(e_geral)}")

# ==========================================
# ENVIO DOS RELATÓRIOS DO TURNO (APENAS PARA O ADMIN)
# ==========================================
def enviar_resumo_funcionario(conta, dados):
    if not dados["detalhes_emails"]: return

    email_destino = ADMIN_EMAIL # Todo relatório vem apenas para você

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <table width="100%" style="border-bottom: 3px solid #FF6600;">
                <tr>
                    <td style="padding: 20px;"><img src="{LOGO_INVESTUR}" style="max-width: 120px;"></td>
                    <td style="padding: 20px; text-align: right;"><h2 style="color: #FF6600; margin: 0; font-size: 18px;">Resumo do Turno - {conta['titan_email']}</h2></td>
                </tr>
            </table>
            <div style="padding: 20px;">
                <p>Abaixo estão os e-mails resgatados da conta <b>{conta['titan_email']}</b>:</p>
                <ul>
    """
    for msg in dados["detalhes_emails"]:
        html += f"<li style='margin-bottom: 12px;'><b>{msg['assunto']}</b> <b style='color: #0056b3; font-size: 11px;'>[{msg['metodo']}]</b><br><span style='font-size: 12px; color: #777;'>De: {msg['remetente']}</span></li>"
    html += "</ul></div></div></body></html>"

    try:
        with smtplib.SMTP_SSL(TITAN_SMTP_SERVER, 465) as smtp_server:
            smtp_server.login(EMAIL_DISPARADOR_ALERTA, SENHA_DISPARADOR_ALERTA)
            msg_resumo = EmailMessage()
            msg_resumo['Subject'] = f"[Monitor TI] Resumo de E-mails - {conta['titan_email']}"
            msg_resumo['From'] = f'"Sistema Monitor TI" <{EMAIL_DISPARADOR_ALERTA}>'
            msg_resumo['To'] = email_destino
            msg_resumo.add_alternative(html, subtype='html')
            smtp_server.send_message(msg_resumo)
    except Exception as e:
        print(f"Erro ao enviar resumo para {email_destino}: {e}")

# ==========================================
# ENVIO DO RELATÓRIO DO ADMIN (A CADA 1 HORA)
# ==========================================
def enviar_relatorio_admin(relatorio_geral):
    total_sucessos = sum(d["sucessos"] for d in relatorio_geral.values())
    total_falhas = sum(len(d["falhas"]) for d in relatorio_geral.values())
    if total_sucessos == 0 and total_falhas == 0: return 

    print(f"\n[SISTEMA] Disparando Relatório Executivo para {ADMIN_EMAIL}...")
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 700px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <table width="100%" style="background-color: #ffffff; border-bottom: 3px solid #FF6600;">
                <tr>
                    <td style="padding: 20px;"><img src="{LOGO_INVESTUR}" style="max-width: 120px;"></td>
                    <td style="padding: 20px; text-align: right;"><h2 style="color: #FF6600; margin: 0;">Relatório Executivo TI (Hora)</h2></td>
                </tr>
            </table>
            <div style="padding: 30px;">
                <p>Status em: <b>{datetime.datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}</b></p>
    """
    for email_conta, dados in relatorio_geral.items():
        if dados["sucessos"] > 0 or dados["falhas"]:
            html += f"<div style='background-color: #fafafa; padding: 15px; border-left: 4px solid #FF6600; margin-bottom: 20px;'>"
            html += f"<h4 style='margin: 0;'> Intervenção: {email_conta}</h4>"
            for msg in dados["detalhes_emails"]:
                html += f"<p style='font-size: 13px;'><b>Assunto:</b> {msg['assunto']}<br>Entregue: {msg['entrega']} [{msg['metodo']}]</p>"
            for erro in dados["falhas"]:
                html += f"<p style='color: dc3545; font-size: 13px;'><b>Falha:</b> {erro}</p>"
            html += "</div>"
    html += "</div></div></body></html>"

    try:
        msg = EmailMessage()
        msg['Subject'] = f"TI Investur - Status da Hora ({total_sucessos} Resgates)"
        msg['From'] = f'"Admin Monitor" <{EMAIL_DISPARADOR_ALERTA}>'
        msg['To'] = ADMIN_EMAIL
        msg.add_alternative(html, subtype='html')
        with smtplib.SMTP_SSL(TITAN_SMTP_SERVER, 465) as s:
            s.login(EMAIL_DISPARADOR_ALERTA, SENHA_DISPARADOR_ALERTA)
            s.send_message(msg)
    except Exception as e: print(f"Erro admin: {e}")

if __name__ == "__main__":
    print(f" Iniciando Monitor de Redundância (Planos A, B, C e D). Todos os alertas vão para {ADMIN_EMAIL}.")
    ultimo_turno_disparado = None
    ultima_hora_disparada = None
    
    while True:
        agora = datetime.datetime.now()
        agora_hora = agora.hour
        turno_atual = "manha" if 9 <= agora_hora < 18 else "noite"
        
        if ultimo_turno_disparado is None: ultimo_turno_disparado = turno_atual
        if ultima_hora_disparada is None: ultima_hora_disparada = agora_hora

        for ciclo in range(1, TOTAL_CICLOS + 1):
            sys.stdout.write(f"\r[Passivo] Ciclo {ciclo}/{TOTAL_CICLOS}... ")
            sys.stdout.flush()
            time.sleep(TEMPO_POR_CICLO_SEG)
            
        print(f"\n[!] Iniciando resgate ativo...")
        for conta in CONTAS:
            verificar_e_acionar_fallback(conta, RELATORIO_TURNO[conta["titan_email"]], RELATORIO_HORA[conta["titan_email"]])

        agora_pos = datetime.datetime.now()
        if agora_pos.hour != ultima_hora_disparada:
            enviar_relatorio_admin(RELATORIO_HORA)
            for c in CONTAS: RELATORIO_HORA[c["titan_email"]] = {"sucessos": 0, "falhas": [], "detalhes_emails": []}
            ultima_hora_disparada = agora_pos.hour

        turno_pos = "manha" if 9 <= agora_pos.hour < 18 else "noite"
        if turno_pos != ultimo_turno_disparado:
            for conta in CONTAS: enviar_resumo_funcionario(conta, RELATORIO_TURNO[conta["titan_email"]])
            for c in CONTAS: RELATORIO_TURNO[c["titan_email"]] = {"detalhes_emails": []}
            ultimo_turno_disparado = turno_pos