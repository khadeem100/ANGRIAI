# Ollama Server - Automated AI Learning Instructions

## OBJECTIVE
Set up an automated pipeline that receives training data from the Angri application and continuously fine-tunes the LLaMA model to improve Jenn's performance.

---

## SERVER DETAILS
- **Server IP**: 65.108.60.66
- **Ollama Port**: 11434
- **Current Model**: llama3.2:3b
- **Target Model**: jenn (continuously updated)

---

## STEP 1: INSTALL REQUIRED SOFTWARE

### 1.1 Install Ollama (if not already installed)
```bash
curl https://ollama.ai/install.sh | sh
```

### 1.2 Install Python and Dependencies
```bash
# Install Python 3.10+
apt update
apt install -y python3 python3-pip

# Install required packages
pip3 install flask requests schedule
```

### 1.3 Create Directory Structure
```bash
mkdir -p /opt/jenn-learning/{training-data,models,logs,scripts}
cd /opt/jenn-learning
```

---

## STEP 2: CREATE TRAINING DATA RECEIVER

### 2.1 Create Flask API to Receive Training Data

Create file: `/opt/jenn-learning/scripts/training_receiver.py`

```python
#!/usr/bin/env python3
import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify

# Configuration
TRAINING_DATA_DIR = "/opt/jenn-learning/training-data"
LOG_FILE = "/opt/jenn-learning/logs/receiver.log"

# Setup logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)

@app.route('/receive-training-data', methods=['POST'])
def receive_training_data():
    """Receive training data from Angri application"""
    try:
        data = request.get_json()
        
        # Validate data
        if not data or 'conversations' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"training_{timestamp}.jsonl"
        filepath = os.path.join(TRAINING_DATA_DIR, filename)
        
        # Save as JSONL
        with open(filepath, 'w') as f:
            for conversation in data['conversations']:
                f.write(json.dumps(conversation) + '\n')
        
        logging.info(f"Received {len(data['conversations'])} conversations, saved to {filename}")
        
        return jsonify({
            'success': True,
            'filename': filename,
            'count': len(data['conversations'])
        }), 200
        
    except Exception as e:
        logging.error(f"Error receiving training data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'jenn-training-receiver'}), 200

if __name__ == '__main__':
    # Create directories if they don't exist
    os.makedirs(TRAINING_DATA_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    # Run on port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### 2.2 Make it Executable
```bash
chmod +x /opt/jenn-learning/scripts/training_receiver.py
```

### 2.3 Create Systemd Service

Create file: `/etc/systemd/system/jenn-training-receiver.service`

```ini
[Unit]
Description=Jenn Training Data Receiver
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/jenn-learning/scripts
ExecStart=/usr/bin/python3 /opt/jenn-learning/scripts/training_receiver.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2.4 Start the Service
```bash
systemctl daemon-reload
systemctl enable jenn-training-receiver
systemctl start jenn-training-receiver
systemctl status jenn-training-receiver
```

---

## STEP 3: CREATE AUTOMATED FINE-TUNING SCRIPT

### 3.1 Create Fine-Tuning Script

Create file: `/opt/jenn-learning/scripts/auto_finetune.py`

```python
#!/usr/bin/env python3
import os
import glob
import json
import logging
import subprocess
from datetime import datetime

# Configuration
TRAINING_DATA_DIR = "/opt/jenn-learning/training-data"
MODELS_DIR = "/opt/jenn-learning/models"
LOG_FILE = "/opt/jenn-learning/logs/finetune.log"
BASE_MODEL = "llama3.2:3b"
MIN_CONVERSATIONS = 50  # Minimum conversations before fine-tuning

# Setup logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def merge_training_files():
    """Merge all JSONL files into one"""
    logging.info("Merging training files...")
    
    jsonl_files = glob.glob(os.path.join(TRAINING_DATA_DIR, "*.jsonl"))
    
    if not jsonl_files:
        logging.warning("No training files found")
        return None
    
    # Count total conversations
    total_conversations = 0
    merged_file = os.path.join(TRAINING_DATA_DIR, "merged_training.jsonl")
    
    with open(merged_file, 'w') as outfile:
        for jsonl_file in jsonl_files:
            with open(jsonl_file, 'r') as infile:
                for line in infile:
                    outfile.write(line)
                    total_conversations += 1
    
    logging.info(f"Merged {len(jsonl_files)} files with {total_conversations} conversations")
    
    if total_conversations < MIN_CONVERSATIONS:
        logging.info(f"Not enough conversations ({total_conversations}/{MIN_CONVERSATIONS}), skipping fine-tune")
        return None
    
    return merged_file, total_conversations

def create_modelfile(version):
    """Create Modelfile for fine-tuning"""
    modelfile_path = os.path.join(MODELS_DIR, f"Modelfile_v{version}")
    
    modelfile_content = f"""FROM {BASE_MODEL}

# Parameters optimized for email assistant
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1

# System prompt
SYSTEM \"\"\"
You are Jenn, an intelligent email assistant created by Tynk Tech VOF in the Netherlands.

Your capabilities:
- Manage and organize emails efficiently
- Create automation rules based on user preferences
- Search and analyze email content
- Provide personalized email management assistance
- Learn from user interactions to improve over time

Your personality:
- Professional yet friendly
- Proactive in suggesting improvements
- Clear and concise in communication
- Respectful of user privacy and preferences

Always prioritize user intent and provide actionable solutions.
\"\"\"
"""
    
    with open(modelfile_path, 'w') as f:
        f.write(modelfile_content)
    
    logging.info(f"Created Modelfile: {modelfile_path}")
    return modelfile_path

def finetune_model():
    """Execute fine-tuning process"""
    try:
        # Merge training files
        result = merge_training_files()
        if not result:
            return False
        
        merged_file, conversation_count = result
        
        # Generate version number
        version = datetime.now().strftime('%Y%m%d_%H%M')
        model_name = f"jenn-v{version}"
        
        logging.info(f"Starting fine-tune for model: {model_name}")
        
        # Create Modelfile
        modelfile = create_modelfile(version)
        
        # Step 1: Create base model from Modelfile
        logging.info("Creating base model...")
        subprocess.run([
            "ollama", "create", f"{model_name}-base", 
            "-f", modelfile
        ], check=True)
        
        # Step 2: Fine-tune with training data
        logging.info("Fine-tuning with training data...")
        subprocess.run([
            "ollama", "create", model_name,
            "--from", f"{model_name}-base",
            "--adapter", merged_file
        ], check=True)
        
        # Step 3: Tag as latest
        logging.info("Tagging as latest...")
        subprocess.run([
            "ollama", "tag", model_name, "jenn:latest"
        ], check=True)
        
        # Step 4: Archive processed training files
        archive_dir = os.path.join(TRAINING_DATA_DIR, "processed", version)
        os.makedirs(archive_dir, exist_ok=True)
        
        for jsonl_file in glob.glob(os.path.join(TRAINING_DATA_DIR, "*.jsonl")):
            if "merged" not in jsonl_file:
                os.rename(jsonl_file, os.path.join(archive_dir, os.path.basename(jsonl_file)))
        
        # Remove merged file
        os.remove(merged_file)
        
        logging.info(f"Fine-tuning complete! Model: {model_name}")
        logging.info(f"Trained on {conversation_count} conversations")
        
        # Test the model
        logging.info("Testing new model...")
        test_result = subprocess.run([
            "ollama", "run", model_name,
            "Hello, who are you?"
        ], capture_output=True, text=True)
        
        logging.info(f"Test response: {test_result.stdout[:200]}")
        
        return True
        
    except Exception as e:
        logging.error(f"Fine-tuning failed: {str(e)}")
        return False

if __name__ == "__main__":
    logging.info("=== Starting automated fine-tuning ===")
    success = finetune_model()
    if success:
        logging.info("=== Fine-tuning completed successfully ===")
    else:
        logging.info("=== Fine-tuning skipped or failed ===")
```

### 3.2 Make it Executable
```bash
chmod +x /opt/jenn-learning/scripts/auto_finetune.py
```

### 3.3 Create Cron Job for Automated Fine-Tuning

```bash
# Edit crontab
crontab -e

# Add this line to run fine-tuning every day at 2 AM
0 2 * * * /usr/bin/python3 /opt/jenn-learning/scripts/auto_finetune.py >> /opt/jenn-learning/logs/cron.log 2>&1
```

---

## STEP 4: CONFIGURE FIREWALL

### 4.1 Allow Incoming Connections
```bash
# Allow port 5000 for training data receiver
ufw allow 5000/tcp

# Verify Ollama port is open
ufw allow 11434/tcp

# Reload firewall
ufw reload
```

---

## STEP 5: VERIFY SETUP

### 5.1 Test Training Data Receiver
```bash
curl -X POST http://65.108.60.66:5000/receive-training-data \
  -H "Content-Type: application/json" \
  -d '{
    "conversations": [
      {
        "messages": [
          {"role": "user", "content": "Test message"},
          {"role": "assistant", "content": "Test response"}
        ]
      }
    ]
  }'
```

Expected response:
```json
{
  "success": true,
  "filename": "training_20241217_143000.jsonl",
  "count": 1
}
```

### 5.2 Test Manual Fine-Tuning
```bash
/usr/bin/python3 /opt/jenn-learning/scripts/auto_finetune.py
```

Check logs:
```bash
tail -f /opt/jenn-learning/logs/finetune.log
```

### 5.3 Verify Model Created
```bash
ollama list | grep jenn
```

You should see:
```
jenn:latest    [timestamp]    [size]
jenn-v[date]   [timestamp]    [size]
```

---

## STEP 6: MONITORING AND MAINTENANCE

### 6.1 Check Service Status
```bash
# Training receiver status
systemctl status jenn-training-receiver

# View receiver logs
tail -f /opt/jenn-learning/logs/receiver.log

# View fine-tuning logs
tail -f /opt/jenn-learning/logs/finetune.log
```

### 6.2 Monitor Disk Space
```bash
# Check training data size
du -sh /opt/jenn-learning/training-data

# Clean old processed data (keep last 30 days)
find /opt/jenn-learning/training-data/processed -type d -mtime +30 -exec rm -rf {} \;
```

### 6.3 Model Management
```bash
# List all models
ollama list

# Remove old model versions (keep last 3)
# Manual cleanup recommended
ollama rm jenn-v[old-version]
```

---

## EXPECTED WORKFLOW

1. **User chats with Jenn** in Angri application
2. **Training data collected** (if consent given)
3. **Data automatically sent** to Ollama server every hour
4. **Training receiver saves** data as JSONL files
5. **Cron job runs daily** at 2 AM
6. **Auto fine-tune script**:
   - Merges all new training files
   - Checks if minimum conversations met (50+)
   - Creates new model version
   - Tags as `jenn:latest`
   - Archives processed data
7. **Angri application** automatically uses `jenn:latest`
8. **Jenn gets smarter** with each cycle!

---

## TROUBLESHOOTING

### Issue: Training receiver not receiving data
```bash
# Check if service is running
systemctl status jenn-training-receiver

# Check firewall
ufw status | grep 5000

# Test locally
curl http://localhost:5000/health
```

### Issue: Fine-tuning fails
```bash
# Check Ollama is running
systemctl status ollama

# Check available disk space
df -h

# Check logs
tail -100 /opt/jenn-learning/logs/finetune.log
```

### Issue: Model not updating
```bash
# Verify cron job is running
grep CRON /var/log/syslog | tail

# Manually trigger fine-tuning
/usr/bin/python3 /opt/jenn-learning/scripts/auto_finetune.py
```

---

## SECURITY NOTES

1. **API Authentication**: Add API key authentication to training receiver
2. **SSL/TLS**: Use HTTPS for production
3. **Rate Limiting**: Implement rate limiting on receiver endpoint
4. **Data Validation**: Validate incoming training data format
5. **Backup**: Regularly backup training data and models

---

## MAINTENANCE SCHEDULE

- **Daily**: Automated fine-tuning (2 AM)
- **Weekly**: Review logs and model performance
- **Monthly**: Clean old processed data and model versions
- **Quarterly**: Review and optimize fine-tuning parameters

---

## SUCCESS CRITERIA

✅ Training receiver service running  
✅ Receiving data from Angri application  
✅ Daily fine-tuning executing successfully  
✅ New model versions created automatically  
✅ `jenn:latest` always points to newest model  
✅ Logs show no errors  
✅ Disk space managed properly  

---

## NEXT STEPS AFTER SETUP

1. Update Angri `.env` to use `jenn:latest`
2. Enable automated training data sync
3. Monitor first fine-tuning cycle
4. Test improved model responses
5. Adjust MIN_CONVERSATIONS threshold as needed
6. Set up monitoring alerts

---

**Your AI will now learn and improve automatically!** 🚀🧠
