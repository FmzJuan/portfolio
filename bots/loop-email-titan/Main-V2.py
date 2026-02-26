import imaplib
import smtplib
import email
import time
import email.utils
import sys
import datetime
import zipfile
import io
from email.message import EmailMessage
from email.utils import parsedate_to_datetime
from email.header import decode_header
import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env para a memória
load_dotenv()

# ==========================================
# CONFIGURAÇÕES DE SERVIDOR E ADMIN
# ==========================================
TITAN_IMAP_SERVER = os.getenv("TITAN_IMAP_SERVER")
TITAN_SMTP_SERVER = os.getenv("TITAN_SMTP_SERVER")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

EMAIL_DISPARADOR_ALERTA = os.getenv("EMAIL_DISPARADOR_ALERTA")
SENHA_DISPARADOR_ALERTA = os.getenv("SENHA_DISPARADOR_ALERTA") 

# URL da logo da Investur para o relatório (Pode hospedar no Imgur ou usar link do site)
LOGO_INVESTUR = "https://investur.com.br/wp-content/imagens-juan/logo.png?_t=1771946394" # Substitua pelo link real da logo

CONTAS = [
   {
      "titan_email": os.getenv("titanEmail_ana"), 
      "titan_password": os.getenv("titanSenha_ana"), 
      "gmail_destino": os.getenv("gmail_ana")
   },
   {
      "titan_email": os.getenv("titanEmail_juan"), 
      "titan_password": os.getenv("titanSenha_juan"), 
      "gmail_destino": os.getenv("gmail_juan")
   },
   {
      "titan_email": os.getenv("titanEmail_gleyce"), 
      "titan_password": os.getenv("titanSenha_gleyce"), 
      "gmail_destino": os.getenv("gmail_gleyce")
   },
   {
      "titan_email": os.getenv("titanEmail_junior"), 
      "titan_password": os.getenv("titanSenha_junior"), 
      "gmail_destino": os.getenv("gmail_junior")
   },
   {
      "titan_email": os.getenv("titanEmail_alberto"), 
      "titan_password": os.getenv("titanSenha_alberto"), 
      "gmail_destino": os.getenv("gmail_alberto")
   },
   {
      "titan_email": os.getenv("titanEmail_silvia"), 
      "titan_password": os.getenv("titanSenha_silvia"), 
      "gmail_destino": os.getenv("gmail_silvia")
   },
   {
      "titan_email": os.getenv("titanEmail_marcel"), 
      "titan_password": os.getenv("titanSenha_marcel"), 
      "gmail_destino": os.getenv("gmail_marcel")
   },
   # {
   #    "titan_email": os.getenv("titanEmail_cristina"), 
   #    "titan_password": os.getenv("titanSenha_cristina"), 
   #    "gmail_destino": os.getenv("gmail_cristina")
   # },
]

TEMPO_POR_CICLO_SEG = 60
TOTAL_CICLOS = 15

# ==========================================
# ARMAZENAMENTO GLOBAL (HORA E TURNO)
# ==========================================
RELATORIO_TURNO = {
    conta["titan_email"]: {"detalhes_emails": [], "arquivos_eml": []}
    for conta in CONTAS
}

RELATORIO_HORA = {
    conta["titan_email"]: {"sucessos": 0, "falhas": [], "detalhes_emails": []}
    for conta in CONTAS
}

def verificar_e_acionar_fallback(conta, dados_turno, dados_hora):
    email_origem = conta["titan_email"]
    senha = conta["titan_password"]
    email_destino = conta["gmail_destino"]

    try:
        mail = imaplib.IMAP4_SSL(TITAN_IMAP_SERVER, 993)
        mail.login(email_origem, senha)
        
        status_sel, _ = mail.select("inbox")
        if status_sel != 'OK':
            mail.logout()
            dados_hora["falhas"].append("Erro ao acessar a Inbox.")
            return

        status, mensagens = mail.search(None, "UNFLAGGED")
        lista_ids = mensagens[0].split()

        if not lista_ids:
            mail.logout()
            return

        smtp_server = smtplib.SMTP_SSL(TITAN_SMTP_SERVER, 465)
        smtp_server.login(email_origem, senha)

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
                
                # Captura os destinatários originais (Grupos/Alias/Cópias)
                original_to = msg_original.get('To')
                original_cc = msg_original.get('Cc')
                
                data_header = msg_original.get('Date')
                str_chegada = "Desconhecida"
                str_ciclo = "Desconhecido"
                if data_header:
                    try:
                        dt_chegada = parsedate_to_datetime(data_header).astimezone()
                        str_chegada = dt_chegada.strftime('%H:%M:%S')
                        atraso_minutos = int((agora_local.astimezone() - dt_chegada).total_seconds() / 60)
                        if 0 <= atraso_minutos < TOTAL_CICLOS:
                            str_ciclo = f"{TOTAL_CICLOS - atraso_minutos}/{TOTAL_CICLOS}"
                        else:
                            str_ciclo = "Antes do Loop"
                    except: pass

                assunto_limpo = assunto_orig.replace('\r', '').replace('\n', '')
                nome_anexo = "".join(c for c in assunto_limpo[:30] if c.isalnum() or c in (' ', '_', '-')).strip()

                # ==========================================
                # PREPARAÇÃO: O E-MAIL ORIGINAL ENCAMINHADO DIRETAMENTE
                # ==========================================
                msg_direta = email.message_from_bytes(raw_email_bytes)
                for header in ['Subject', 'From', 'To', 'Cc', 'Bcc', 'Reply-To', 'Return-Path', 'Sender', 'Message-ID']:
                    if header in msg_direta:
                        del msg_direta[header]
                
                msg_direta['Subject'] = assunto_limpo 
                nome_exibicao = nome_cliente if nome_cliente else email_cliente
                msg_direta['From'] = f'"{nome_exibicao} (via TI)" <{email_origem}>'
                
                # Injeta o Alias/Grupo Original para o funcionário ver a quem foi enviado
                if original_to:
                    msg_direta['To'] = original_to
                else:
                    msg_direta['To'] = email_destino
                if original_cc:
                    msg_direta['Cc'] = original_cc

                if email_cliente: msg_direta['Reply-To'] = email_cliente

                metodo_usado = ""
                
                # ==========================================
                # OS 4 PLANOS DE ENVIO (Com Plano de Contenção)
                # ==========================================
                try:
                    # PLANO A1: Tenta enviar preservando os grupos e cópias originais
                    smtp_server.send_message(msg_direta, from_addr=email_origem, to_addrs=[email_destino])
                    dados_hora["sucessos"] += 1
                    mail.store(num, '+FLAGS', '(\\Seen \\Deleted)')
                    metodo_usado = "Plano A1 (Nativo c/ Grupo)"
                    
                except Exception:
                    # PLANO A2 (CONTENÇÃO): Se o Titan bloquear o Alias, apaga o grupo e força o Gmail (Comportamento Antigo)
                    try:
                        del msg_direta['To']
                        if 'Cc' in msg_direta: del msg_direta['Cc']
                        msg_direta['To'] = email_destino
                        
                        smtp_server.send_message(msg_direta, from_addr=email_origem, to_addrs=[email_destino])
                        dados_hora["sucessos"] += 1
                        mail.store(num, '+FLAGS', '(\\Seen \\Deleted)')
                        metodo_usado = "Plano A2 (Nativo Forçado)"
                        
                    except Exception:
                        # PLANO B: ZIP (Anexo Gigante)
                        try:
                            msg_zip = EmailMessage()
                            msg_zip['Subject'] = f"[COMPACTADO] {assunto_limpo}"
                            msg_zip['From'] = f'"{nome_exibicao} (via TI)" <{email_origem}>'
                            msg_zip['To'] = email_destino
                            if email_cliente: msg_zip['Reply-To'] = email_cliente
                            
                            msg_zip.add_alternative(f"<b>⚠️ SISTEMA TI:</b> A mensagem original excedeu o limite do servidor. O arquivo original .ZIP está anexo.", subtype='html')
                            
                            zip_buffer = io.BytesIO()
                            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                                zip_file.writestr(f"{nome_anexo}.eml", raw_email_bytes)
                            msg_zip.add_attachment(zip_buffer.getvalue(), maintype='application', subtype='zip', filename=f"{nome_anexo}.zip")
                            
                            smtp_server.send_message(msg_zip, from_addr=email_origem, to_addrs=[email_destino])
                            dados_hora["sucessos"] += 1
                            mail.store(num, '+FLAGS', '(\\Seen \\Deleted)')
                            metodo_usado = "Plano B (ZIP)"
                            
                        except Exception:
                            # PLANO C: Retido na Origem
                            try:
                                msg_lite = EmailMessage()
                                msg_lite['Subject'] = f"[ARQUIVO RETIDO] {assunto_limpo}"
                                msg_lite['From'] = f'"{nome_exibicao} (via TI)" <{email_origem}>'
                                msg_lite['To'] = email_destino
                                if email_cliente: msg_lite['Reply-To'] = email_cliente
                                
                                msg_lite.add_alternative(f"<b>🚨 SISTEMA TI:</b> A mensagem de {remetente_orig} tem arquivos muito pesados. <b>Acesse o webmail do Titan para abrir.</b>", subtype='html')
                                smtp_server.send_message(msg_lite, from_addr=email_origem, to_addrs=[email_destino])
                                dados_hora["sucessos"] += 1
                                mail.store(num, '+FLAGS', '(\\Seen \\Flagged)')
                                metodo_usado = "Plano C (Retido)"
                                
                            except Exception:
                                # FALHA TOTAL
                                mail.store(num, '+FLAGS', '(\\Seen \\Flagged)')
                                dados_hora["falhas"].append(f"Bloqueio crônico do Servidor: {assunto_limpo}")
                                metodo_usado = "Falha de Entrega (Bloqueado)"

                # ==========================================
                # SALVA PARA OS RELATÓRIOS
                # ==========================================
                str_entrega = agora_local.strftime('%H:%M:%S')
                info_email = {
                    "assunto": assunto_limpo, 
                    "remetente": remetente_orig,
                    "chegada": str_chegada, 
                    "entrega": str_entrega, 
                    "ciclo": str_ciclo,
                    "metodo": metodo_usado
                }
                
                # Alimenta a gaveta do Admin (Hora)
                dados_hora["detalhes_emails"].append(info_email)
                
                # Alimenta a gaveta do Usuário (Turno)
                dados_turno["detalhes_emails"].append(info_email)
                dados_turno["arquivos_eml"].append({"nome": nome_anexo, "bytes": raw_email_bytes})

            except Exception as e_msg:
                dados_hora["falhas"].append(f"Erro no parseamento '{assunto_orig}': {str(e_msg)}")

        mail.expunge()
        smtp_server.quit()
        mail.logout()

    except Exception as e_geral:
        dados_hora["falhas"].append(f"Falha de Conexão: {str(e_geral)}")

# ==========================================
# ENVIO DOS RELATÓRIOS DO USUÁRIO (Às 9h e 18h)
# ==========================================
def enviar_resumo_funcionario(conta, dados):
    if not dados["detalhes_emails"]: return

    email_destino = conta["gmail_destino"]
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #ffffff; color: #333; margin: 0; padding: 20px;">
        <div style="max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <table width="100%" style="border-bottom: 3px solid #FF6600;">
                <tr>
                    <td style="padding: 20px;"><img src="{LOGO_INVESTUR}" style="max-width: 120px;"></td>
                    <td style="padding: 20px; text-align: right;"><h2 style="color: #FF6600; margin: 0; font-size: 18px;">Resumo do Turno (TI)</h2></td>
                </tr>
            </table>
            <div style="padding: 20px;">
                <p>Olá, aqui está o consolidado dos e-mails que nosso sistema de segurança resgatou para você neste turno.</p>
                <p><i>Nota: Todos esses e-mails já foram entregues individualmente na sua caixa, mas deixamos os arquivos originais (.eml) em anexo abaixo como garantia.</i></p>
                <ul>
    """
    for msg in dados["detalhes_emails"]:
        html += f"<li style='margin-bottom: 8px;'><b>{msg['assunto']}</b> <br><span style='font-size: 12px; color: #777;'>De: {msg['remetente']}</span></li>"
    html += "</ul></div></div></body></html>"

    try:
        with smtplib.SMTP_SSL(TITAN_SMTP_SERVER, 465) as smtp_server:
            smtp_server.login(EMAIL_DISPARADOR_ALERTA, SENHA_DISPARADOR_ALERTA)
            
            try:
                msg_resumo = EmailMessage()
                msg_resumo['Subject'] = "[TI Investur] Resumo de E-mails Resgatados"
                msg_resumo['From'] = f'"Sistema de Segurança TI" <{EMAIL_DISPARADOR_ALERTA}>'
                msg_resumo['To'] = email_destino
                msg_resumo.add_alternative(html, subtype='html')
                
                for eml in dados["arquivos_eml"]:
                    msg_resumo.add_attachment(eml['bytes'], maintype='message', subtype='rfc822', filename=f"{eml['nome']}.eml")
                
                smtp_server.send_message(msg_resumo)
                
            except Exception:
                try:
                    msg_resumo_zip = EmailMessage()
                    msg_resumo_zip['Subject'] = "[COMPACTADO] Resumo de E-mails Resgatados"
                    msg_resumo_zip['From'] = f'"Sistema de Segurança TI" <{EMAIL_DISPARADOR_ALERTA}>'
                    msg_resumo_zip['To'] = email_destino
                    msg_resumo_zip.add_alternative(html, subtype='html')
                    
                    zip_buffer = io.BytesIO()
                    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                        for eml in dados["arquivos_eml"]:
                            zip_file.writestr(f"{eml['nome']}.eml", eml['bytes'])
                            
                    msg_resumo_zip.add_attachment(zip_buffer.getvalue(), maintype='application', subtype='zip', filename="Backup_Arquivos_Originais.zip")
                    smtp_server.send_message(msg_resumo_zip)
                    
                except Exception:
                    msg_resumo_lite = EmailMessage()
                    msg_resumo_lite['Subject'] = "[ATENÇÃO] Resumo de E-mails Resgatados (Sem Anexos)"
                    msg_resumo_lite['From'] = f'"Sistema de Segurança TI" <{EMAIL_DISPARADOR_ALERTA}>'
                    msg_resumo_lite['To'] = email_destino
                    msg_resumo_lite.add_alternative(html + "<br><b style='color:red;'>⚠️ Os anexos originais excederam o limite global e não puderam ser empacotados.</b>", subtype='html')
                    smtp_server.send_message(msg_resumo_lite)

    except Exception as e:
        print(f"Erro ao enviar resumo para {email_destino}: {e}")

# ==========================================
# ENVIO DO RELATÓRIO DO ADMIN (A CADA 1 HORA)
# ==========================================
def enviar_relatorio_admin(relatorio_geral):
    total_sucessos = sum(d["sucessos"] for d in relatorio_geral.values())
    total_falhas = sum(len(d["falhas"]) for d in relatorio_geral.values())
    
    if total_sucessos == 0 and total_falhas == 0:
        return 

    print(f"\n[SISTEMA] Disparando Relatório Executivo (Hora) para {ADMIN_EMAIL}...")
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; color: #333; margin: 0;">
        <div style="max-width: 700px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <table width="100%" style="background-color: #ffffff; border-bottom: 3px solid #FF6600;">
                <tr>
                    <td style="padding: 20px;"><img src="{LOGO_INVESTUR}" style="max-width: 120px;"></td>
                    <td style="padding: 20px; text-align: right;"><h2 style="color: #FF6600; margin: 0;">Relatório Executivo TI (Hora)</h2></td>
                </tr>
            </table>
            <div style="padding: 30px;">
                <p>Varredura da última hora concluída em: <b>{datetime.datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}</b></p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    """
    
    for email_conta, dados in relatorio_geral.items():
        if dados["sucessos"] == 0 and not dados["falhas"]:
            pass 
        else:
            html += f"<div style='background-color: #fafafa; padding: 15px; border-left: 4px solid #FF6600; margin-bottom: 20px;'>"
            html += f"<h4 style='margin: 0 0 10px 0; color: #333;'>⚠️ Intervenção em: {email_conta}</h4>"
            
            for msg in dados["detalhes_emails"]:
                html += f"""
                <div style='font-size: 13px; color: #555; margin-bottom: 10px; border-bottom: 1px dashed #ddd; padding-bottom: 8px;'>
                    <b style='color: #333;'>Assunto:</b> {msg['assunto']}<br>
                    <span style='color: #dc3545;'>Chegou no Servidor:</span> {msg['chegada']} (Estimado Ciclo {msg['ciclo']})<br>
                    <span style='color: #28a745;'>Entregue pelo Script:</span> {msg['entrega']} <b style='color: #0056b3;'>[{msg['metodo']}]</b><br>
                </div>
                """
            
            if dados["falhas"]:
                for erro in dados["falhas"]:
                    html += f"<p style='color: #dc3545; font-size: 13px; margin: 5px 0 0 0;'><b>Falha Real:</b> {erro}</p>"
            
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
    except Exception as e:
        print(f"Erro admin: {e}")

if __name__ == "__main__":
    print(f"🚀 Iniciando Fallback. Admin recebe a cada 1h. Usuários recebem às 09:00 e 18:00.")
    ultimo_turno_disparado = None
    ultima_hora_disparada = None
    
    while True:
        agora = datetime.datetime.now()
        agora_hora = agora.hour
        turno_atual = "manha" if 9 <= agora_hora < 18 else "noite"
        
        if ultimo_turno_disparado is None: ultimo_turno_disparado = turno_atual
        if ultima_hora_disparada is None: ultima_hora_disparada = agora_hora

        # ==========================================
        # VERIFICAÇÃO DE ROTINA (A cada 15 min)
        # ==========================================
        for ciclo in range(1, TOTAL_CICLOS + 1):
            sys.stdout.write(f"\r[Passivo] Aguardando Titan. Ciclo {ciclo}/{TOTAL_CICLOS}... ")
            sys.stdout.flush()
            time.sleep(TEMPO_POR_CICLO_SEG)
            
        sys.stdout.write("\r" + " " * 60 + "\r")
        print(f"\n[!] Iniciando resgate ativo e silencioso...")
        
        for conta in CONTAS:
            print(f"   > Verificando {conta['titan_email']}...")
            verificar_e_acionar_fallback(conta, RELATORIO_TURNO[conta["titan_email"]], RELATORIO_HORA[conta["titan_email"]])

        agora_pos = datetime.datetime.now()
        agora_hora_pos = agora_pos.hour
        turno_pos = "manha" if 9 <= agora_hora_pos < 18 else "noite"

        # ==========================================
        # GATILHO DO ADMIN (DISPARA A CADA 1 HORA)
        # ==========================================
        if agora_hora_pos != ultima_hora_disparada:
            print(f"\n[⏰] FECHAMENTO DE HORA ({agora_hora_pos}h)! Disparando relatório do Admin...")
            enviar_relatorio_admin(RELATORIO_HORA)
            
            for c in CONTAS:
                RELATORIO_HORA[c["titan_email"]] = {"sucessos": 0, "falhas": [], "detalhes_emails": []}
            ultima_hora_disparada = agora_hora_pos

        # ==========================================
        # GATILHO DOS TURNOS (DISPARA PARA FUNCIONÁRIOS ÀS 9h E 18h)
        # ==========================================
        if turno_pos != ultimo_turno_disparado:
            print("\n[⏰] MUDANÇA DE TURNO! Disparando pacote de anexos para os usuários...")
            for conta in CONTAS:
                enviar_resumo_funcionario(conta, RELATORIO_TURNO[conta["titan_email"]])
                
            for c in CONTAS:
                RELATORIO_TURNO[c["titan_email"]] = {"detalhes_emails": [], "arquivos_eml": []}
            ultimo_turno_disparado = turno_pos