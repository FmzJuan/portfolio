import os
import shutil
import datetime
import subprocess
import threading
import time
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext

class OutlookBackupApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Automação de Backup e Restauração - Outlook")
        self.root.geometry("600x720")
        
        # Variáveis de controle
        self.is_running = False
        self.scheduler_thread = None
        
        # Obter caminho dinâmico do usuário atual do Windows
        user_profile = os.path.expanduser('~')
        default_source = os.path.join(user_profile, 'Documents', 'Arquivos do Outlook')
        default_dest = r"G:\Meu Drive\Operacional\Servidor\11 - Adm\3.Ti\Cristina-outlook-auto"
        
        # --- INTERFACE GRÁFICA ---
        
        # Origem
        tk.Label(root, text="Pasta de Origem (Arquivos Locais):").pack(anchor='w', padx=10, pady=(10, 0))
        self.source_var = tk.StringVar(value=default_source)
        source_frame = tk.Frame(root)
        source_frame.pack(fill='x', padx=10)
        tk.Entry(source_frame, textvariable=self.source_var).pack(side='left', fill='x', expand=True)
        tk.Button(source_frame, text="Procurar", command=lambda: self.browse_folder(self.source_var)).pack(side='right', padx=(5, 0))

        # Destino
        tk.Label(root, text="Pasta de Destino (Servidor/Drive):").pack(anchor='w', padx=10, pady=(10, 0))
        self.dest_var = tk.StringVar(value=default_dest)
        dest_frame = tk.Frame(root)
        dest_frame.pack(fill='x', padx=10)
        tk.Entry(dest_frame, textvariable=self.dest_var).pack(side='left', fill='x', expand=True)
        tk.Button(dest_frame, text="Procurar", command=lambda: self.browse_folder(self.dest_var)).pack(side='right', padx=(5, 0))

        # Configurações de Tarefa
        config_frame = tk.Frame(root)
        config_frame.pack(fill='x', padx=10, pady=15)
        
        tk.Label(config_frame, text="Horário do Backup (HH:MM):").grid(row=0, column=0, sticky='w')
        self.time_var = tk.StringVar(value="18:00")
        tk.Entry(config_frame, textvariable=self.time_var, width=10).grid(row=0, column=1, sticky='w', padx=10)
        
        self.delete_var = tk.BooleanVar(value=False)
        tk.Checkbutton(config_frame, text="Remover arquivos locais após o backup?", variable=self.delete_var).grid(row=1, column=0, columnspan=2, sticky='w', pady=5)

        # Botões de Ação (Backup)
        btn_frame = tk.Frame(root)
        btn_frame.pack(pady=5)
        self.btn_start = tk.Button(btn_frame, text="Iniciar Agendamento", width=20, bg="lightgreen", command=self.toggle_scheduler)
        self.btn_start.pack(side='left', padx=5)
        
        self.btn_run_now = tk.Button(btn_frame, text="Fazer Backup Agora", width=20, command=self.run_backup_thread)
        self.btn_run_now.pack(side='left', padx=5)

        # Botão de Restauração (Ação 2)
        restore_frame = tk.Frame(root)
        restore_frame.pack(pady=10)
        self.btn_restore = tk.Button(restore_frame, text="Ação 2: Restaurar Backup para Local", width=42, bg="lightblue", command=self.run_restore_thread)
        self.btn_restore.pack()

        # Log
        tk.Label(root, text="Log de Execução:").pack(anchor='w', padx=10)
        self.log_area = scrolledtext.ScrolledText(root, height=15, state='disabled')
        self.log_area.pack(fill='both', expand=True, padx=10, pady=(0, 10))
        
        self.log_message("Sistema iniciado. Aguardando comandos.")

    def browse_folder(self, var):
        folder = filedialog.askdirectory()
        if folder:
            var.set(folder)

    def log_message(self, message):
        """Escreve no log da interface e no arquivo .txt"""
        timestamp = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        # Atualiza UI de forma segura
        self.log_area.config(state='normal')
        self.log_area.insert(tk.END, log_entry)
        self.log_area.see(tk.END)
        self.log_area.config(state='disabled')
        
        # Salva no arquivo de log txt
        try:
            with open("backup_log.txt", "a", encoding="utf-8") as f:
                f.write(log_entry)
        except Exception as e:
            pass

    def get_next_folder_name(self, dest_base):
        """Lógica para criar de C1 até C10 e depois resetar"""
        if not os.path.exists(dest_base):
            os.makedirs(dest_base)
            
        existing_c = []
        for d in os.listdir(dest_base):
            if d.startswith('C') and d[1:].isdigit():
                existing_c.append(int(d[1:]))
                
        if not existing_c:
            return 'C1'
            
        current_max = max(existing_c)
        if current_max >= 10:
            self.log_message("Limite C10 atingido. Limpando pastas antigas (C1 a C10)...")
            for i in range(1, 11):
                folder_to_del = os.path.join(dest_base, f'C{i}')
                if os.path.exists(folder_to_del):
                    try:
                        shutil.rmtree(folder_to_del)
                    except Exception as e:
                        self.log_message(f"Erro ao deletar {folder_to_del}: {e}")
            return 'C1'
        else:
            return f'C{current_max + 1}'

    def run_backup_process(self):
        """A lógica principal do backup"""
        source = self.source_var.get().strip()
        dest_base = self.dest_var.get().strip()
        delete_local = self.delete_var.get()
        
        # Normalizar os caminhos para evitar conflitos de barras no Windows
        source = os.path.normpath(source)
        dest_base = os.path.normpath(dest_base)
        
        self.log_message(f"--- INICIANDO ROTINA DE BACKUP ---")
        
        # 1. Finalizar Outlook
        self.log_message("Tentando finalizar o Outlook...")
        try:
            subprocess.run(["taskkill", "/F", "/IM", "outlook.exe"], capture_output=True)
            time.sleep(4) 
            self.log_message("Comando de fechamento do Outlook enviado.")
        except Exception as e:
            self.log_message(f"Aviso ao tentar fechar Outlook: {e}")

        # 2. Verificar pastas
        if not os.path.exists(source):
            self.log_message(f"ERRO: Pasta de origem não encontrada: {source}")
            return
            
        # 3. Descobrir qual pasta C(x) criar
        next_folder_name = self.get_next_folder_name(dest_base)
        final_dest = os.path.join(dest_base, next_folder_name)
        
        try:
            os.makedirs(final_dest, exist_ok=True)
            self.log_message(f"Pasta de destino criada: {next_folder_name}")
            
            # 4. Copiar arquivos
            self.log_message(f"Copiando arquivos de {source} para {final_dest}...")
            arquivos_copiados = 0
            for item in os.listdir(source):
                s = os.path.join(source, item)
                d = os.path.join(final_dest, item)
                if os.path.isfile(s):
                    # Alterado para shutil.copy para evitar erro de metadados no Google Drive
                    shutil.copy(s, d)
                    arquivos_copiados += 1
            
            self.log_message(f"Sucesso: {arquivos_copiados} arquivos copiados.")
            
            # 5. Deletar origem se marcado (Com sistema de tentativas)
            if delete_local:
                self.log_message("Removendo arquivos da pasta de origem conforme configurado...")
                for item in os.listdir(source):
                    s = os.path.join(source, item)
                    if os.path.isfile(s):
                        for attempt in range(3):
                            try:
                                os.remove(s)
                                break 
                            except PermissionError:
                                self.log_message(f"Arquivo {item} em uso. Tentando novamente em 3 segundos...")
                                time.sleep(3)
                        else:
                            self.log_message(f"ERRO: Não foi possível apagar {item}. O Windows ainda está bloqueando o arquivo.")
                self.log_message("Etapa de remoção finalizada.")
                
            self.log_message("--- BACKUP CONCLUÍDO ---")
            
        except Exception as e:
            self.log_message(f"ERRO CRÍTICO DURANTE O BACKUP: {str(e)}")

    def run_restore_process(self, backup_folder):
        """Lógica para a Ação 2: Restaurar do Drive para o Local"""
        source = self.source_var.get().strip()
        
        # Normalizar os caminhos para alinhar perfeitamente com o Windows Explorer
        backup_folder = os.path.normpath(backup_folder.strip())
        source = os.path.normpath(source)
        
        self.log_message(f"--- INICIANDO RESTAURAÇÃO ---")
        self.log_message(f"Origem do backup: {backup_folder}")
        
        # 1. Fechar Outlook antes de substituir o arquivo local
        self.log_message("Fechando Outlook para liberar arquivos locais...")
        try:
            subprocess.run(["taskkill", "/F", "/IM", "outlook.exe"], capture_output=True)
            time.sleep(4)
        except Exception:
            pass
            
        # 2. Segurança: Garantir que a pasta de destino local exista
        if not os.path.exists(source):
            try:
                os.makedirs(source, exist_ok=True)
                self.log_message(f"Aviso: A pasta local não existia e foi recriada: {source}")
            except Exception as e:
                self.log_message(f"ERRO ao criar pasta local: {e}")
                return

        # 3. Copiar de volta
        try:
            arquivos_restaurados = 0
            for item in os.listdir(backup_folder):
                s = os.path.join(backup_folder, item)
                d = os.path.join(source, item)
                
                if os.path.isfile(s):
                    self.log_message(f"Restaurando arquivo: {item}...")
                    # Alterado para shutil.copy para evitar falha de metadados de drives virtuais
                    shutil.copy(s, d)
                    arquivos_restaurados += 1
                    
            self.log_message(f"Restauração concluída com sucesso! {arquivos_restaurados} arquivos copiados para o computador local.")
            self.log_message("Você já pode abrir o Outlook.")
        except Exception as e:
            self.log_message(f"ERRO CRÍTICO DURANTE RESTAURAÇÃO: {str(e)}")

    def run_backup_thread(self):
        threading.Thread(target=self.run_backup_process, daemon=True).start()

    def run_restore_thread(self):
        # A janela para selecionar a pasta abre na Thread Principal
        dest_base = self.dest_var.get().strip()
        backup_folder = filedialog.askdirectory(initialdir=dest_base, title="Selecione a pasta de backup (Ex: C1, C2...)")
        
        if not backup_folder:
            self.log_message("Restauração cancelada pelo usuário.")
            return
            
        # Inicia o processo de cópia em segundo plano
        threading.Thread(target=self.run_restore_process, args=(backup_folder,), daemon=True).start()

    def scheduler_loop(self):
        """Loop que verifica a hora a cada minuto"""
        while self.is_running:
            now = datetime.datetime.now().strftime("%H:%M")
            target_time = self.time_var.get()
            
            if now == target_time:
                self.run_backup_thread()
                time.sleep(61) 
            else:
                time.sleep(15)

    def toggle_scheduler(self):
        if not self.is_running:
            self.is_running = True
            self.btn_start.config(text="Parar Agendamento", bg="salmon")
            self.log_message(f"Agendador ativado para as {self.time_var.get()}.")
            self.scheduler_thread = threading.Thread(target=self.scheduler_loop, daemon=True)
            self.scheduler_thread.start()
        else:
            self.is_running = False
            self.btn_start.config(text="Iniciar Agendamento", bg="lightgreen")
            self.log_message("Agendador pausado.")

if __name__ == "__main__":
    root = tk.Tk()
    app = OutlookBackupApp(root)
    root.mainloop()