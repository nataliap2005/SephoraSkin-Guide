# Proyecto SephoraSkin-Guide

Este proyecto se trabajó en dos máquinas virtuales Ubuntu definidas con el siguiente Vagrantfile:

```bash
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  # Configuración del plugin vagrant-vbguest
  if Vagrant.has_plugin?("vagrant-vbguest")
    config.vbguest.no_install   = true
    config.vbguest.auto_update  = false
    config.vbguest.no_remote    = true
  end

  # Definición de la máquina cliente
  config.vm.define :clienteUbuntu do |clienteUbuntu|
    clienteUbuntu.vm.box = "bento/ubuntu-22.04"
    clienteUbuntu.vm.hostname = "clienteUbuntu"
    clienteUbuntu.vm.network :private_network, ip: "192.168.100.3"
  end

  # Definición de la máquina servidor
  config.vm.define :servidorUbuntu do |servidorUbuntu|
    servidorUbuntu.vm.box = "bento/ubuntu-22.04"
    servidorUbuntu.vm.hostname = "servidorUbuntu"
    servidorUbuntu.vm.network :private_network, ip: "192.168.100.2"
  end

end
```

## Requisitos de instalación (Para las dos máquinas)

### Docker
```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Docker compose (se instaló junto con docker)
```bash
docker compose version
```

### MySQL
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install mysql-server -y
```

Verificar estado del servicio:
```bash
sudo systemctl status mysql
```

## Clonar el repositorio
```bash
git clone https://github.com/Mariana-Cifuentes/SephoraSkin-Guide.git proyecto
```

Validar que la carpeta se clonó exitosamente:
```bash
cd ~/proyecto
ls 
```

Deberías de ver algo así:
```
/proyecto
 ├── favoritos/          # Microservicio gestión de favoritos (Node.js, Dockerfile)
 ├── productos/          # Microservicio productos (Node.js, Dockerfile)
 ├── resenas/            # Microservicio reseñas (Node.js, Dockerfile)
 ├── usuarios/           # Microservicio usuarios (Node.js, Dockerfile)
 ├── mysql_init/         # Scripts SQL para inicialización de bases de datos
 ├── spark-analisis/     # Scripts de análisis con Spark
 ├── docker-swarm.yml    # Configuración para despliegue con Docker Swarm
```

## Inicializar cluster con docker swarm (dentro de la carpeta del proyecto)

### En la máquina clienteUbuntu (manager, IP: 192.168.100.3):
```bash
docker swarm init --advertise-addr 192.168.100.3
```

### En la maquina servidorUbuntu (worker, IP: 192.168.100.2):
```bash
docker swarm join --token SWMTKN-1-xxxxx 192.168.100.3:2377
```

### Verificar nodos en el cluster (en la máquina manager):
```bash
docker node ls
```

## Desplegar servicios
```bash
docker stack deploy -c docker-swarm.yml sephora_stack
```

### Comandos útiles:
```bash
# Verificar servicios desplegados
docker stack services sephora_stack

# Escalar servicios
docker service scale sephora_productos=4

# Ver logs
docker service logs sephora_frontend

# Ver nodos del cluster
docker node ls
```

# Segunda Parte: Análisis y Dashboard

En esta segunda parte del proyecto, se realizaron análisis de datos utilizando Apache Spark para procesar grandes volúmenes de datos de productos de Sephora, y luego se desarrolló un dashboard interactivo con Dash y Bootstrap para visualizar los resultados de forma clara y atractiva.

## 1. Configurar el Cluster de Spark

### En clienteUbuntu (MASTER):
```bash
cd ~/labSpark/spark-3.5.0-bin-hadoop3/conf/
cp spark-env.sh.template spark-env.sh
vim spark-env.sh
```

Agregar al final:
```bash
SPARK_LOCAL_IP=192.168.100.3
SPARK_MASTER_HOST=192.168.100.3
```

Iniciar el master:
```bash
cd ~/labSpark/spark-3.5.0-bin-hadoop3/sbin/
./start-master.sh
```

### En servidorUbuntu (WORKER):
```bash
cd ~/labSpark/spark-3.5.0-bin-hadoop3/conf/
cp spark-env.sh.template spark-env.sh
vim spark-env.sh
```

Agregar al final:
```bash
SPARK_LOCAL_IP=192.168.100.2
SPARK_MASTER_HOST=192.168.100.3
```

Iniciar el worker:
```bash
cd ~/labSpark/spark-3.5.0-bin-hadoop3/sbin/
./start-worker.sh spark://192.168.100.3:7077
```

Verificar que diga "Successfully registered with master".

## 2. Preparación del entorno
En las 2 máquinas ejecutar:
```bash
sudo -i
mkdir spark-analisis
cd spark-analisis
mv /vagrant/product_info.csv .
```

## 3. Análisis con Apache Spark
Ejecutar el script analisis.py:
```bash
cd labSpark/spark-3.5.5-bin-hadoop3/bin/
./spark-submit \
  --master spark://192.168.100.3:7077 \
  --conf spark.driver.host=192.168.100.3 \
  --conf spark.executor.memory=1g \
  /root/proyecto/spark-analisis/analisis.py
```

Este script:
- Lee product_info.csv
- Convierte y limpia datos
- Genera los archivos CSV de análisis en /root/results/ (ranking_popularidad, relacion_precio_popularidad, price_segment_analysis, stock_analysis)

## 4. Ejecutar el dashboard
En servidorUbuntu:
```bash
cd /root/proyecto/spark-analisis/
python3 dashprueba.py
```

Luego abre en el navegador la URL indicada (por defecto http://localhost:8050 o tu IP).
