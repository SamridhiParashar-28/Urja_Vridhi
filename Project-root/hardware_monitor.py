import socket
import tkinter as tk
from tkinter import font
import threading
import time
from collections import deque
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.gridspec as gridspec

ESP_IP   = "10.205.143.142"   # ← Updated to current ESP IP
ESP_PORT = 8080

# ── Appliance config ──────────────────────────────────
APPLIANCE_NAMES = ["Appliance 1", "Appliance 2", "Appliance 3", "Appliance 4"]
COLORS          = ["#2ecc71", "#3498db", "#e67e22", "#9b59b6"]
MAX_POINTS      = 60    # 60 seconds of history
MAINS_VOLTAGE   = 230   # volts (India)

# ── Shared state ──────────────────────────────────────
relay_states  = [False] * 4
sensor_amps   = [0.0]  * 4   # latest current reading per sensor
usage_wh      = [0.0]  * 4   # cumulative Wh
on_duration   = [0.0]  * 4   # seconds each appliance detected as ON

amp_history   = [deque(maxlen=MAX_POINTS) for _ in range(4)]
watt_history  = [deque(maxlen=MAX_POINTS) for _ in range(4)]
time_history  = [deque(maxlen=MAX_POINTS) for _ in range(4)]
start_time    = time.time()

# ── Relay Controller ──────────────────────────────────
class RelayController:
    def __init__(self):
        self.sock      = None
        self.connected = False
        self.lock      = threading.Lock()
        threading.Thread(target=self.keep_alive,    daemon=True).start()
        threading.Thread(target=self.receive_loop,  daemon=True).start()

    def connect(self):
        try:
            self.sock = socket.socket()
            self.sock.settimeout(5)
            self.sock.connect((ESP_IP, ESP_PORT))
            self.sock.settimeout(2)
            self.connected = True
            return True
        except:
            self.connected = False
            return False

    def keep_alive(self):
        while True:
            if not self.connected:
                self.connect()
            time.sleep(3)

    def send(self, cmd):
        with self.lock:
            for _ in range(3):
                try:
                    if not self.connected:
                        if not self.connect():
                            continue
                    self.sock.send((cmd + '\n').encode())
                    return True
                except:
                    self.connected = False
                    try: self.connect()
                    except: pass
            return False

    def receive_loop(self):
        buf = ""
        while True:
            try:
                if self.connected and self.sock:
                    chunk = self.sock.recv(256).decode(errors='ignore')
                    if chunk:
                        buf += chunk
                        while '\n' in buf:
                            line, buf = buf.split('\n', 1)
                            line = line.strip()
                            if line.startswith("SENSOR:"):
                                parse_sensor(line)
            except socket.timeout:
                pass
            except:
                self.connected = False
            time.sleep(0.05)

def parse_sensor(line):
    """Parse SENSOR:0.261:0.000:0.435:0.000 from Arduino."""
    parts = line.split(':')[1:]
    t = time.time() - start_time
    for i, part in enumerate(parts[:4]):
        try:
            amps = float(part.strip())
            sensor_amps[i] = amps
            watts = amps * MAINS_VOLTAGE
            amp_history[i].append(amps)
            watt_history[i].append(watts)
            time_history[i].append(t)
            if amps > 0.05:   # noise floor
                on_duration[i] += 1
                usage_wh[i] += watts / 3600.0
        except:
            pass

controller   = RelayController()
buttons_on   = []
buttons_off  = []
state_labels = []

def send_cmd(cmd, relay_idx=None, turning_on=None):
    def do_send():
        success = controller.send(cmd)
        if success:
            status.config(text=f"✓ {cmd}", fg="#2ecc71")
            if relay_idx is not None:
                relay_states[relay_idx] = turning_on
                root.after(0, update_buttons)
        else:
            status.config(text=f"✗ Failed — retrying...", fg="#e74c3c")
            root.after(2000, lambda: send_cmd(cmd, relay_idx, turning_on))
    threading.Thread(target=do_send, daemon=True).start()

def update_buttons():
    for i in range(4):
        if relay_states[i]:
            buttons_on[i].config(bg="#1a8a4a",  relief=tk.SUNKEN)
            buttons_off[i].config(bg="#e74c3c", relief=tk.RAISED)
            state_labels[i].config(text="● ON",  fg="#2ecc71")
        else:
            buttons_on[i].config(bg="#27ae60",  relief=tk.RAISED)
            buttons_off[i].config(bg="#a93226",  relief=tk.SUNKEN)
            state_labels[i].config(text="● OFF", fg="#e74c3c")

def update_connection_status():
    if controller.connected:
        conn_label.config(text="● Connected",       fg="#2ecc71")
    else:
        conn_label.config(text="● Reconnecting...", fg="#f39c12")
    root.after(1000, update_connection_status)

def all_on():
    for i in range(4):
        send_cmd(f"R{i+1}ON", i, True)
        time.sleep(0.2)

def all_off():
    for i in range(4):
        send_cmd(f"R{i+1}OFF", i, False)
        time.sleep(0.2)

# ── Main relay GUI window ─────────────────────────────
root = tk.Tk()
root.title("Wireless Power Management System")
root.geometry("420x560")
root.configure(bg="#0f0f1a")
root.resizable(False, False)

title_font = font.Font(family="Arial", size=14, weight="bold")
btn_font   = font.Font(family="Arial", size=10, weight="bold")
lbl_font   = font.Font(family="Arial", size=11)

hdr = tk.Frame(root, bg="#16213e", pady=10)
hdr.pack(fill=tk.X)
tk.Label(hdr, text="⚡ Power Management System",
         bg="#16213e", fg="white", font=title_font).pack()
conn_label = tk.Label(hdr, text="● Connecting...",
                      bg="#16213e", fg="#f39c12", font=("Arial", 9))
conn_label.pack()
tk.Label(hdr, text=f"ESP: {ESP_IP}:{ESP_PORT}",
         bg="#16213e", fg="#7f8c8d", font=("Arial", 8)).pack()

main_frame = tk.Frame(root, bg="#0f0f1a")
main_frame.pack(pady=15, padx=15, fill=tk.X)

for i in range(4):
    row = tk.Frame(main_frame, bg="#16213e", relief=tk.RIDGE, bd=1)
    row.pack(fill=tk.X, pady=5)

    tk.Label(row, text=APPLIANCE_NAMES[i],
             bg="#16213e", fg="#e0e0e0",
             font=lbl_font, width=13, anchor='w').pack(side=tk.LEFT, padx=10, pady=10)

    sl = tk.Label(row, text="● OFF", bg="#16213e", fg="#e74c3c",
                  font=("Arial", 9, "bold"), width=6)
    sl.pack(side=tk.LEFT)
    state_labels.append(sl)

    bon = tk.Button(row, text="ON", width=6,
                    bg="#27ae60", fg="white", font=btn_font,
                    command=lambda x=i: send_cmd(f"R{x+1}ON", x, True))
    bon.pack(side=tk.LEFT, padx=5, pady=8)
    buttons_on.append(bon)

    boff = tk.Button(row, text="OFF", width=6,
                     bg="#a93226", fg="white", font=btn_font,
                     command=lambda x=i: send_cmd(f"R{x+1}OFF", x, False))
    boff.pack(side=tk.LEFT, pady=8)
    buttons_off.append(boff)

ctrl = tk.Frame(root, bg="#0f0f1a")
ctrl.pack(pady=10)
tk.Button(ctrl, text="⚡ ALL ON",  width=12, bg="#27ae60", fg="white", font=btn_font,
          command=lambda: threading.Thread(target=all_on,  daemon=True).start()
          ).pack(side=tk.LEFT, padx=10)
tk.Button(ctrl, text="⭘ ALL OFF", width=12, bg="#c0392b", fg="white", font=btn_font,
          command=lambda: threading.Thread(target=all_off, daemon=True).start()
          ).pack(side=tk.LEFT, padx=10)

status = tk.Label(root, text="Connecting to ESP...",
                  bg="#0f0f1a", fg="#f39c12", font=("Arial", 10))
status.pack(pady=10)

# ── Chart window ──────────────────────────────────────
chart_win = tk.Toplevel(root)
chart_win.title("ACS712 — Live Current & Power Monitor")
chart_win.geometry("940x680")
chart_win.configure(bg="#0f0f1a")
chart_win.resizable(True, True)

root.update_idletasks()
chart_win.geometry(
    f"940x680+{root.winfo_x() + root.winfo_width() + 10}+{root.winfo_y()}"
)

# ── Matplotlib layout ─────────────────────────────────
fig = plt.Figure(facecolor="#0f0f1a")
gs  = gridspec.GridSpec(3, 2, figure=fig,
                         hspace=0.65, wspace=0.38,
                         top=0.91, bottom=0.07,
                         left=0.09, right=0.97)

ax_lines = [
    fig.add_subplot(gs[0, 0]),
    fig.add_subplot(gs[0, 1]),
    fig.add_subplot(gs[1, 0]),
    fig.add_subplot(gs[1, 1]),
]
ax_bar = fig.add_subplot(gs[2, 0])   # live watts bar
ax_wh  = fig.add_subplot(gs[2, 1])   # cumulative Wh bar

for ax in ax_lines + [ax_bar, ax_wh]:
    ax.set_facecolor("#16213e")
    ax.tick_params(colors="#aaaaaa", labelsize=7)
    for spine in ax.spines.values():
        spine.set_edgecolor("#333355")

# Current line plots
line_amps = []
line_watt = []
for i, ax in enumerate(ax_lines):
    la, = ax.plot([], [], color=COLORS[i],   linewidth=1.8, label="Amps")
    lw, = ax.plot([], [], color="#ffffff",    linewidth=0.8,
                  linestyle="--", alpha=0.4,  label="W/100")
    line_amps.append(la)
    line_watt.append(lw)
    ax.set_title(APPLIANCE_NAMES[i], color=COLORS[i], fontsize=8, pad=3)
    ax.set_xlabel("Time (s)", color="#aaaaaa", fontsize=6)
    ax.set_ylabel("Current (A)", color="#aaaaaa", fontsize=6)
    ax.set_ylim(-0.05, 1.0)
    ax.legend(fontsize=5, loc="upper right",
              facecolor="#0f0f1a", labelcolor="white", framealpha=0.5)

# Live watts bar
live_bars = ax_bar.bar(APPLIANCE_NAMES, [0]*4, color=COLORS, alpha=0.9)
ax_bar.set_title("Live Power (W)", color="white", fontsize=8, pad=3)
ax_bar.set_ylabel("Watts", color="#aaaaaa", fontsize=7)
ax_bar.set_ylim(0, 200)
ax_bar.tick_params(axis='x', labelsize=6, colors="#aaaaaa")

# Cumulative Wh bar
wh_bars = ax_wh.bar(APPLIANCE_NAMES, [0]*4, color=COLORS, alpha=0.9)
ax_wh.set_title("Energy Used (Wh)", color="white", fontsize=8, pad=3)
ax_wh.set_ylabel("Wh", color="#aaaaaa", fontsize=7)
ax_wh.set_ylim(0, 1)
ax_wh.tick_params(axis='x', labelsize=6, colors="#aaaaaa")

fig.suptitle("⚡ ACS712 Current Sensor — Real-Time Power Monitor",
             color="white", fontsize=10, fontweight="bold")

canvas = FigureCanvasTkAgg(fig, master=chart_win)
canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

# Stats row
stats_frame = tk.Frame(chart_win, bg="#16213e")
stats_frame.pack(fill=tk.X, padx=5, pady=(0, 6))
stat_labels_chart = []
for i in range(4):
    lbl = tk.Label(stats_frame,
                   text=f"{APPLIANCE_NAMES[i]}\n0.000A | 0.0W | 0.000Wh",
                   bg="#16213e", fg=COLORS[i],
                   font=("Courier", 8, "bold"), width=24)
    lbl.pack(side=tk.LEFT, expand=True)
    stat_labels_chart.append(lbl)

# ── Animation ─────────────────────────────────────────
def animate(_frame):
    for i in range(4):
        th = list(time_history[i])
        ah = list(amp_history[i])
        wh_live = list(watt_history[i])
        if not th:
            continue

        # Current line
        line_amps[i].set_data(th, ah)
        # Scaled watts overlay (÷100 so it fits same axis)
        line_watt[i].set_data(th, [w / 100.0 for w in wh_live])

        ax_lines[i].set_xlim(max(0, th[-1] - 60), th[-1] + 1)
        ax_lines[i].set_ylim(-0.05, max(1.0, max(ah) * 1.3))

        # Live power bar
        live_w = sensor_amps[i] * MAINS_VOLTAGE
        live_bars[i].set_height(live_w)

        # Cumulative Wh bar
        wh_bars[i].set_height(usage_wh[i])

        # Stats
        mins = int(on_duration[i] // 60)
        secs = int(on_duration[i] % 60)
        stat_labels_chart[i].config(
            text=f"{APPLIANCE_NAMES[i]}\n"
                 f"{sensor_amps[i]:.3f}A | {live_w:.1f}W | "
                 f"{usage_wh[i]:.3f}Wh | {mins}m{secs:02d}s"
        )

    # Auto-scale bar axes
    max_w  = max(b.get_height() for b in live_bars)
    max_wh = max(usage_wh) if max(usage_wh) > 0 else 1
    ax_bar.set_ylim(0, max(200, max_w * 1.3))
    ax_wh.set_ylim( 0, max_wh * 1.35)

    canvas.draw()

ani = animation.FuncAnimation(fig, animate, interval=1000, cache_frame_data=False)

# ── Launch ────────────────────────────────────────────
update_connection_status()
root.mainloop()
