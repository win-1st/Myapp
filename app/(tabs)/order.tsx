import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    Image,
    TouchableOpacity,
} from 'react-native';

export default function OrderScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/200x200' }}
                    style={styles.emptyImage}
                />
                <Text style={styles.title}>Ouch! Hungry</Text>
                <Text style={styles.subtitle}>Seems like you have not</Text>
                <Text style={styles.subtitle}>ordered any food yet</Text>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Find Foods</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyImage: {
        width: 200,
        height: 200,
        marginBottom: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        marginTop: 32,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});